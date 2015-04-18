var orgId, cpeId;

var parameterNames = Radio.parameterNames;
var path = Radio.path;

var channelValues = {
  '2': 'channel2Values',
  '5': 'channel5Values'
};

var bandwidthValues = {
  '2': 'bandwidthValues2',
  '5': 'bandwidthValues5'
};

var radioPage = {
  '2': new Object(),
  '5': new Object()
};
var radioRecord = {
  '2': new Object(),
  '5': new Object()
};

var bandwidthList = {
  "n": "20MHz,40MHz",
  "b": "20MHz",
  "bgn": "20MHz",
  "gn": "20MHz",
  "bg": "20MHz",
  "ac": "20MHz,40MHz,80MHz"
};

var radio2ChannelList = {
  '20MHz': "1,2,3,4,5,6,7,8,9,10,11",
  '40MHz': '1,2,3,4,5,6,7'
};

var radio5ChannelList = {
  'dfsEnabled': {
    '20MHz': '36,40,44,48,52,56,60,64,100,104,108,112,132,136,149,153,157,161',
    '40MHz': '36,44,52,60,100,108,132,149,157',
    '80MHz': '36,52,100,132,149'
  },
  'dfsDisabled': {
    '20MHz': '36,40,44,48,149,153,157,161',
    '40MHz': '36,44,149,157',
    '80MHz': '36,149'
  }
};

var enableButtons = function(type) {
  var typeElement = '#' + Radio.radioId[type];
  var buttons = $(typeElement + ' ' + '#submit' + ',' + typeElement + ' ' + '#cancel');
  buttons.prop('disabled', false);
};

var disableButtons = function(type) {
  var typeElement = '#' + Radio.radioId[type];
  var buttons = $(typeElement + ' ' + '#submit' + ',' + typeElement + ' ' + '#cancel');
  buttons.prop('disabled', true);
};

var getInitBandwidthValues = function() {
  var standard = this['Standard'];
  return bandwidthList[standard];
};

var getInitChannelValues = function(type) {
  var bandwidth = this['X_000631_OperatingChannelBandwidth'];
  if (type === '2')
    return radio2ChannelList[bandwidth];

  if (this['X_000631_EnableDfsChannels'] === 'true') { //dfsEnabled
    return radio5ChannelList['dfsEnabled'][bandwidth];
  } else {
    return radio5ChannelList['dfsDisabled'][bandwidth];
  }
};

Template.radio.rendered = function() {
  Session.set(channelValues['2']);
  Session.set(channelValues['5']);
  Session.set(bandwidthValues['2']);
  Session.set(bandwidthValues['5']);
};

Template.radio.created = function() {
  orgId = Utils.getOrgId();
  cpeId = Utils.getCpeId();
};

Template.radio.helpers({
  isType2: function(type) {
    return type === '2';
  },

  isType5: function(type) {
    return type === '5';
  },

  radioSummaryReady: function(type) {
    return Session.equals('radio' + type + '-summary-ready', true);
  },

  radio: function(type) {
    radio = Session.get('radio' + type);
    if (radio) {
      radio['type'] = type;
      Radio.init.call(radio, radioPage[type], radioRecord[type]);
      disableButtons(type);
      return radio;
    }
  },

  radioId: function(type) {
    return Radio.radioId[type];
  },

  isEqual: function(value1, value2) {
    return value1 === value2;
  },

  bandwidths: function() {
    var type = this['type'];
    var values = Session.get(bandwidthValues[type]);
    if (values != null) {
      var bandwidth = $('#' + Radio.radioId[type] + ' ' + '#bandwidth').prop('value');
      var result = Radio.bandwidths(values, bandwidth);
      onChange(result['selectedValue'], 'bandwidth', type);
      if (type === '5') {
        var dfs = $('#' + Radio.radioId[type] + ' ' + '#dfsEnable').prop('checked') ? 'dfsEnabled' : 'dfsDisabled';
        Session.set(channelValues[type], radio5ChannelList[dfs][result['selectedValue']]); //may be the channel list will be changed
      }
      return result['bandwidths'];
    } else {
      values = getInitBandwidthValues.call(this);
      return Radio.bandwidths(values, this['X_000631_OperatingChannelBandwidth'])['bandwidths'];
    }
  },

  radioError: function(type) {
    return Session.get('radio' + type + 'Error');
  },

  channels: function() {
    var type = this['type'];
    var values = Session.get(channelValues[type]);
    if (values != null) {
      var element = $('#' + Radio.radioId[type] + ' ' + '#channel');
      var value = element.prop('value');
      //console.log(value);
      var result;
      if (value === 'Auto')
        result = Radio.channels(values, 'true', null);
      result = Radio.channels(values, 'false', value);
      onChange(result['selectedValue'], 'channel', type);
      return result['channels'];
    } else {
      values = getInitChannelValues.call(this, type);
      if (typeof values === 'undefined') {
        Logger.warn('The software version of the CPE is too old');
        return;
      }        
      return Radio.channels(values, this['AutoChannelEnable'], this['Channel'])['channels'];
    }
  },

  transmitPowers: function(transmitPowerValues) {
    return Radio.transmitPowers.call(this, transmitPowerValues);
  }
});

var onChange = function(selectedValue, id, type) {
  if (selectedValue !== radioPage[type][id]) {
    radioRecord[type][id] = true;
    enableButtons(type);
  } else {
    radioRecord[type][id] = false;
    if (Radio.isChanged(radioRecord[type]) === false) {
      disableButtons(type);
    }
  }
};

Template.radio.events({
  'click #radioEnabled,#multicastForwardEnable': function(event) {
    var element = $(event.currentTarget);
    onChange(element.prop('checked'), element.prop('id'), this['type']);
  },

  'click #dfsEnable': function(event) {
    var element = $(event.currentTarget);
    var isChecked = element.prop('checked');
    var type = this['type'];
    onChange(isChecked, element.prop('id'), type);
    var bandwidth = $('#' + Radio.radioId[type] + ' ' + '#bandwidth').prop('value');
    Session.set(channelValues[type], radio5ChannelList[isChecked ? 'dfsEnabled' : 'dfsDisabled'][bandwidth]);
  },

  'change #standard': function(event) {
    var element = $(event.currentTarget);
    var type = this['type'];
    onChange(element.prop('value'), element.prop('id'), type);
    Session.set(bandwidthValues[type], bandwidthList[element.prop('value')]);
  },

  'change #channel,#transmitPower': function(event) {
    var element = $(event.currentTarget);
    onChange(element.prop('value'), element.prop('id'), this['type']);
  },

  'change #bandwidth': function(event) {
    var type = this['type'];
    var element = $(event.currentTarget);
    onChange(element.prop('value'), element.prop('id'), type);
    if (type === '5') {
      var dfsEnabled = $('#' + Radio.radioId[type] + ' ' + '#dfsEnable').prop('checked') === true ? 'dfsEnabled' : 'dfsDisabled';
      Session.set(channelValues['5'], radio5ChannelList[dfsEnabled][element.prop('value')]);
    } else {
      Session.set(channelValues['2'], radio2ChannelList[element.prop('value')]);
    }
  },

  'click #submit': function(event) {
    event.preventDefault();
    var type = this['type'];
    var changedParameters = Radio.getChangedParameters.call(this, radioRecord[type]);
    console.log(changedParameters);
    Session.set('radio' + type + '-summary-ready', false);
    var oldObj = Session.get('radio' + type);
    Meteor.call('setRadio', orgId, cpeId, type, changedParameters, function(error, result) {
      Radio.setErrorResult(error, result, type, oldObj, changedParameters);
    });
  },

  'click #cancel': function(event) {
    event.preventDefault();
    var type = this['type'];

    var radioEnabledDisplay = 'radioEnabled';
    var standardDisplay = 'standard';
    var bandwidthDisplay = 'bandwidth';
    var channelDisplay = 'channel';
    var powerDisplay = 'transmitPower';
    var multicastForwardEnableDisplay = 'multicastForwardEnable';
    var dfsEnabledDisplay = "dfsEnable";

    var key = radioEnabledDisplay;
    var preSearchString = '#' + Radio.radioId[type] + ' ' + '#';

    if (radioRecord[type][key])
      $(preSearchString + key).prop('checked', radioPage[type][key]);

    var key = standardDisplay;
    if (radioRecord[type][key])
      $(preSearchString + key).prop('value', radioPage[type][key]);

    key = bandwidthDisplay;
    if (radioRecord[type][key]) {
      $(preSearchString + key).prop('value', radioPage[type][key]);
    }

    Session.set(bandwidthValues[type]);

    key = powerDisplay;
    if (radioRecord[type][key])
      $(preSearchString + key).prop('value', radioPage[type][key]);

    key = multicastForwardEnableDisplay;
    if (radioRecord[type][key])
      $(preSearchString + key).prop('checked', radioPage[type][key]);

    key = dfsEnabledDisplay;
    if (radioRecord[type][key])
      $(preSearchString + key).prop('checked', radioPage[type][key]);


    key = channelDisplay;
    if (radioRecord[type][key]) {
      $(preSearchString + key).prop('value', radioPage[type][key]);
    }

    if (type === '5') {
      Session.set(channelValues['5']);
    } else {
      Session.set(channelValues['2']);
    }

    Radio.initRecord(radioRecord[type]);
    disableButtons(type);
  }
});

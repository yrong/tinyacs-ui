Radio = Radio || {};
var radio2Instancetype = '1';
var radio5Instancetype = '9';

var radioEnabledDisplay = 'radioEnabled';
var standardDisplay = 'standard';
var bandwidthDisplay = 'bandwidth';
var channelDisplay = 'channel';
var powerDisplay = 'transmitPower';
var multicastForwardEnableDisplay = 'multicastForwardEnable';
var dfsEnabledDisplay = "dfsEnable";

var radioEnabledStore = 'RadioEnabled';
var standardStore = 'Standard';
var bandwidthStore = 'X_000631_OperatingChannelBandwidth';
var channelStore = 'Channel';
var autoChannelEnableStore = 'AutoChannelEnable';
var powerStore = 'TransmitPower';
var multicastForwardEnableStore = 'X_CALIX_MulticastForwardEnable';
var dfsEnableStore = "X_000631_EnableDfsChannels";

Radio.getParameterNames = function(type) {
  var path;
  var parameters = [radioEnabledStore, standardStore, bandwidthStore, autoChannelEnableStore, channelStore, powerStore];
  if (type === '2') {
    parameters.push(multicastForwardEnableStore);
    path = 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.' + radio2Instancetype + '.';
  } else {
    parameters.push(dfsEnableStore);
    path = 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.' + radio5Instancetype + '.';
  }
  var result = [];
  for (var i = 0; i < parameters.length; i++)
    result.push(path + parameters[i]);
  return result;
};

Radio.getChangedParameters = function(radioRecord) {
  var result = new Object();

  var preSearchString = '#' + Radio.radioId[this['type']] + ' ' + '#';
  //RadioEnabled
  var key = radioEnabledDisplay;
  if (radioRecord[key]) {
    result[radioEnabledStore] = $(preSearchString + key).prop('checked').toString();
  }

  //Standard
  var key = standardDisplay;
  if (radioRecord[key]) {
    result[standardStore] = $(preSearchString + key).prop('value');
  }

  //Bandwidth
  key = bandwidthDisplay;
  if (radioRecord[key]) {
    result[bandwidthStore] = $(preSearchString + key).prop('value');
  }

  //TransmitPower
  key = powerDisplay;
  if (radioRecord[key]) {
    var transmitPower = $(preSearchString + key).prop('value');
    result[powerStore] = transmitPower.slice(0, transmitPower.length - 1);
  }

  //Channel & AutoChannelEnable
  key = channelDisplay;
  if (radioRecord[key] === true) {
    var channel = $(preSearchString + key).prop('value');
    if (channel === 'Auto') {
      result[autoChannelEnableStore] = 'true';
    } else {
      if (this[autoChannelEnableStore] === 'true') {
        result[autoChannelEnableStore] = 'false';
        result[channelStore] = channel;
      } else
        result[channelStore] = channel;
    }
  }

  //multicastForwardEnable
  key = multicastForwardEnableDisplay;
  if (radioRecord[key]) {
    result[multicastForwardEnableStore] = $(preSearchString + key).prop('checked').toString();
  }

  //dfsEnable
  key = dfsEnabledDisplay;
  if (radioRecord[key]) {
    result[dfsEnableStore] = $(preSearchString + key).prop('checked').toString();
  }
  return result;
};

Radio.bandwidths = function(bandwidthValues, selectedBandwidth) {
  var valueToText = {
    '20MHz': '20 MHz',
    '40MHz': '40 MHz',
    '80MHz': '80 MHz'
  };
  var bandwidthArray = bandwidthValues.replace(/\s+/g, '').split(',');
  var index, obj, result = new Object();
  result['bandwidths'] = [];
  for (index = 0; index < bandwidthArray.length; index++) {
    obj = {
      'selected': false,
      'value': bandwidthArray[index],
      'text': valueToText[bandwidthArray[index]]
    };
    result['bandwidths'].push(obj);
  }
  index = 0; //AutoChannelEnable = true
  while (index < bandwidthArray.length) {
    if (bandwidthArray[index] === selectedBandwidth) {
      break;
    }
    index++;
  };

  if (index === bandwidthArray.length) {
    index = 0;
  }
  result['bandwidths'][index]['selected'] = true;
  result['selectedValue'] = result['bandwidths'][index]['value'];
  return result;
};

Radio.channels = function(channelValues, isAutoChannel, selectedChannel) {
  var channelArray = channelValues.replace(/\s+/g, '').split(',');
  var index, obj, result = new Object();
  result['channels'] = [];
  obj = {
    'selected': false,
    'value': 'Auto'
  };
  result['channels'].push(obj);
  for (index = 0; index < channelArray.length; index++) {
    obj = {
      'selected': false,
      'value': channelArray[index]
    };
    result['channels'].push(obj);
  }
  index = 0; //AutoChannelEnable = true
  if (isAutoChannel === 'false') {
    do {
      if (channelArray[index] === selectedChannel) {
        index++;
        break;
      }
      index++;
    } while (index < channelArray.length);
  }

  if (index === channelArray.length)
    index = 0;

  result['channels'][index]['selected'] = true;
  result['selectedValue'] = result['channels'][index]['value'];
  return result;
};

Radio.transmitPowers = function(transmitPowerValues) {
  var transmitPowerArray = transmitPowerValues.replace(/\s+/g, '').split(',');
  var index, obj, result = [];
  for (index = 0; index < transmitPowerArray.length; index++) {
    obj = {
      'selected': false,
      'value': transmitPowerArray[index] + '%'
    };
    result.push(obj);
  }
  for (index = 0; index < transmitPowerArray.length; index++) {
    if (transmitPowerArray[index] === this['TransmitPower'])
      break;
  }
  result[index]['selected'] = true;
  return result;
};

Radio.isChanged = function(radioRecord) {
  var values = _.values(radioRecord);
  for (var i = 0; i < values.length; i++)
    if (values[i] === true)
      return true;
  return false;
};

Radio.initRecord = function(radioRecord) {
  radioRecord[radioEnabledDisplay] = false;
  radioRecord[standardDisplay] = false;
  radioRecord[bandwidthDisplay] = false;
  radioRecord[channelDisplay] = false;
  radioRecord[powerDisplay] = false;
  radioRecord[multicastForwardEnableDisplay] = false;
  radioRecord[dfsEnabledDisplay] = false;
};

Radio.init = function(radioPage, radioRecord) {
  radioPage[radioEnabledDisplay] = (this[radioEnabledStore] === 'true');
  radioPage[standardDisplay] = this[standardStore];
  radioPage[bandwidthDisplay] = this[bandwidthStore];
  if (this[autoChannelEnableStore] === 'true')
    radioPage[channelDisplay] = 'Auto';
  else
    radioPage[channelDisplay] = this[channelStore];

  radioPage[powerDisplay] = this[powerStore] + '%';
  radioPage[multicastForwardEnableDisplay] = (this[multicastForwardEnableStore] === 'true');
  radioPage[dfsEnabledDisplay] = (this[dfsEnableStore] === 'true');
  Radio.initRecord(radioRecord);
};

Radio.getErrorResult = function(error, result, type, radioPath) {
  Session.set('radio' + type, null);
  if (error) {
    Session.set('radio' + type + 'Error', error['reason']);
  } else { //getParameterValues successfully
    var currentObj = Utils.getValueByPath(result, radioPath);
    Session.set('radio' + type, currentObj);
  }
  Session.set('radio' + type + '-summary-ready', true);
};

Radio.setErrorResult = function(error, result, type, oldObj, newObj) {
  Session.set('radio' + type + 'Error', null);
  if (error) {
    Session.set('radio' + type + 'Error', error['reason']);
  } else { //setParameterValues successfully
    newObj = _.extend(oldObj, newObj);
    if (type === '2') {
      Session.set('bandwidthValues2');
      Session.set('channel2Values');
    } else {
      Session.set('bandwidthValues5');
      Session.set('channel5Values');
    }

    Session.set('radio' + type, newObj);
  }
  Session.set('radio' + type + '-summary-ready', true);
};

Radio.parameterNames = {
  '2': Radio.getParameterNames('2'),
  '5': Radio.getParameterNames('5')
};
Radio.path = {
  '2': 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.1',
  '5': 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.9'
};
Radio.radioId = {
  '2': 'radioConfigure2',
  '5': 'radioConfigure5'
};

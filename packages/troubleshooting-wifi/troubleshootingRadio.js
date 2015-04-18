var orgId, cpeId;

var parameterNames = Radio.parameterNames;
var path = Radio.path;

Template.troubleshootingRadio.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.troubleshootingRadio.created = function() {
  orgId = Utils.getOrgId();
  cpeId = Utils.getCpeId();
};

Template.troubleshootingRadio.helpers({
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
      return radio;
    }
  },

  radioId: function(type) {
    return Radio.radioId[type];
  },

  status: function(name) {
    return this[name] === 'true' ? 'On' : 'Off';
  },

  getMode: function() {
    var modes = {
      'n': '802.11n',
      'b': '802.11b',
      'bg': '802.11b, 802.11g',
      'gn': '802.11g, 802.11n',
      'bgn': '802.11b, 802.11g, 802.11n',
      'ac': '802.11ac'
    };
    return modes[this['Standard']];
  },

  getBandwidth: function() {
    return this['X_000631_OperatingChannelBandwidth'];
  },

  getChannel: function() {
    if (this['AutoChannelEnable'] === 'true')
      return 'Auto' + ' ' +'(Channel' + ' ' + this['Channel'] + ')';
    return this['Channel'];
  },

  radioError: function(type) {
    return Session.get('radio' + type + 'Error');
  }
});

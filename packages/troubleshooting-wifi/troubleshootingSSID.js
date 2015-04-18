var orgId, cpeId;

var encryptionStoreToDisplay = {
  'AESEncryption': 'AES',
  'TKIPEncryption': 'TKIP',
  'TKIPandAESEncryption': 'Both'
};

var securityStoreToDisplay = {
  'WPAand11i': 'WPA WPA2 Personal',
 // 'WPA': 'WPA-Personal',
  '11i': 'WPA2-Personal'
};

var securityOffState = "securityOffState";

var clone = function(obj) {
  if (null == obj || "object" != typeof obj) return obj;
  var copy = obj.constructor();
  for (var attr in obj) {
    if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
  }
  return copy;
};

Template.troubleshootingSSID.created = function() {
  orgId = Utils.getOrgId();
  cpeId = Utils.getCpeId();
};

Template.troubleshootingSSID.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.troubleshootingSSID.helpers({
  getSsid: function() {
    return Session.get('ssid');
  },

  ready: function() {
    return Session.get('ssid-ready');
  },

  status: function(name) {
    if (this[name] == 'true' || this[name] == true) {
      return 'On'
    }
    return 'Off';
  },

  loading: function() {
    return Session.get('loading') === true;
  },

  wlans: function() {
    var onService = [], offService = [];
    var obj;
    for (var i = 1; i <= 16; i++) {
      obj = Utils.getValueByPath(this, 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.' + i);
      obj['index'] = i;
      obj['style'] = '';
      if (obj['Enable'] === 'true' || obj['Enable'] === true) {
        onService.push(obj);
      } else {
        obj['style'] = "background-color: #eee;color: #999;";
        offService.push(obj);
      }
    }
    return onService.concat(offService);
  },

  error: function() {
    return Session.get('ssidError');
  },

  frequencyBand: function() {
    var frequency = Utils.getValueByPath(this, 'X_000631_OperatingFrequencyBand');
    if (frequency === '') {
      frequency = '2.4GHz';
    }
    return frequency;
  },

  beaconType: function() {
    var beaconTypeValue = this['BeaconType'];
    var security = securityStoreToDisplay[beaconTypeValue];
    if (typeof security === 'undefined') {
      if (this['BasicEncryptionModes'] === 'None' && this['BasicAuthenticationMode'] === 'None') {
        this[securityOffState] = true;
        return 'Security Off';
      }
      /* else
        return 'WEP';*/
    }
    this[securityOffState] = false;
    return security;
  },

  encryption: function() {
    return encryptionStoreToDisplay[this['IEEE11iEncryptionModes']];
  }
});

Meteor.methods({
  getRadio: function(orgId, cpeId, paramNames) {
    return AcsNbi.getParameterValues.call(this, orgId, cpeId, true, paramNames).data;
  },

  setRadio: function(orgId, cpeId, type, changedParameters) {
    var setObj = {
      "InternetGatewayDevice": {
        "LANDevice": {
          "1": {
            "WLANConfiguration": {}
          }
        }
      }
    };
    if (type === '2') {
      setObj.InternetGatewayDevice.LANDevice['1'].WLANConfiguration['1'] = changedParameters;
    } else {
      setObj.InternetGatewayDevice.LANDevice['1'].WLANConfiguration['9'] = changedParameters;
    }

    AcsNbi.setParameterValues(orgId, cpeId, setObj);
  },

  getSsid: function(orgId, cpeId) {
    var ssidParamNames = ['X_000631_OperatingFrequencyBand',
        'SSID',
        'Enable',
        'SSIDAdvertisementEnabled',
        'BeaconType',
        'BasicEncryptionModes',
        'BasicAuthenticationMode',
        'IEEE11iEncryptionModes',
        'PreSharedKey.1.KeyPassphrase'
      ],
      paramNames = [];

    for (var i = 1; i <= 16; i++) {
      for (var j = 0; j < ssidParamNames.length; j++) {
        var path = 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.' + i + '.' + ssidParamNames[j];
        paramNames.push(path);
      }
    }

    return AcsNbi.getParameterValues.call(this, orgId, cpeId, true, paramNames).data;
  },

  setSsid: function(orgId, cpeId, setObj) {
    AcsNbi.setParameterValues(orgId, cpeId, setObj);
  },

  // Retrieve KeyPassphrase from DB, since the device does not return it.
  getPassphrase: function(orgId, cpeId, index) {
    var path = 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.' + index + '.PreSharedKey.1.KeyPassphrase';
    var params = [path + "."];
    var result = AcsNbi.retrieveData.call(this, orgId, cpeId, /* not liveData */false, /* cachedData only */ true, params);
    return Utils.getValueByPath(result.data, path);
  }
});

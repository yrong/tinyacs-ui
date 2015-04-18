var wanPathAlias = 'X_CALIX_SXACC_DefaultWanConnectionPath';
var remote_control = function(orgId, cpeId,enable) {
  var paramValues;
  if(enable){
    paramValues = {
      "InternetGatewayDevice.UserInterface.RemoteAccess.Enable": true,
      "InternetGatewayDevice.User.2.RemoteAccessCapable": true,
      "InternetGatewayDevice.User.2.Enable": true
    }
  }else{
    paramValues = {
      "InternetGatewayDevice.UserInterface.RemoteAccess.Enable": false,
      "InternetGatewayDevice.User.2.RemoteAccessCapable": false
    }
  }  
  return AcsNbi.setParameterValues(orgId, cpeId, paramValues);
};

Meteor.methods({
  remote_enable: function(orgId, serialNumber) {
    var cpeId = Utils.buildCpeId(serialNumber),
      paramReference = wanPathAlias + '.ExternalIPAddress',
      paramReferenceExp = /^(.*)\.ExternalIPAddress$/,
      paramNames = [paramReference],
      wanConnectionPath, ipAddr, config, result, key, match;

    
    result = AcsNbi.getParameterValues.call(this, orgId, cpeId, true, paramNames);

    for (key in result.data) {
      // Use translated path if reference is translated
      if (key.indexOf(paramReference) == 0) {
        match = paramReferenceExp.exec(result.data[key]);
        if (match != null) {
          wanConnectionPath = match[1];
        }
        break;
      }
    }
    ipAddr = Utils.getValueByPath(result.data, wanConnectionPath + '.ExternalIPAddress');

    result = AcsNbi.getParameterValues.call(this, orgId, cpeId, true, [
      "InternetGatewayDevice.UserInterface.RemoteAccess."
    ]);

    config = Utils.getValueByPath(result.data, "InternetGatewayDevice.UserInterface.RemoteAccess");
    config.IpAddress = ipAddr;

    result = AcsNbi.getParameterValues.call(this, orgId, cpeId, true, [
      "InternetGatewayDevice.User.2.Username",
      "InternetGatewayDevice.User.2.Password"
    ]);
    config.username = Utils.getValueByPath(result.data, "InternetGatewayDevice.User.2.Username");
    config.password = Utils.getValueByPath(result.data, "InternetGatewayDevice.User.2.Password");

    remote_control(orgId,cpeId,true);

    Meteor.setTimeout(function() {
      remote_control(orgId, cpeId,false);
    }, 30 * 60 * 1000);

    return config;
  }
});

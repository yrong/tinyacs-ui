Meteor.methods({
  getWifiSsids: function(orgId, serialNumber,fake) {
    var cpeId = Utils.buildCpeId(serialNumber),
      paramNames = ['InternetGatewayDevice.LANDevice.1.WLANConfiguration.'],result;
    if(fake){
        return {};
    }else{
        result = AcsNbi.getParameterValues.call(this, orgId, cpeId, true, paramNames);
        //Logger.info(JSON.stringify(result.data, null, 4));
        return result.data;
    }
  },

  getAllLanHosts: function(orgId, serialNumber,fake) {
    var hostsPath = 'InternetGatewayDevice.LANDevice.1.Hosts.',
      paramNames = [hostsPath],
      hosts, result,cpeId = Utils.buildCpeId(serialNumber);

     if(fake){
        return {};
     }else{
        result = AcsNbi.getParameterValues.call(this, orgId, cpeId, true, paramNames).data;

        hosts = Utils.getValueByPath(result, hostsPath);
        if (hosts != null && hosts.Host != null) {
          //Logger.info(JSON.stringify(hosts.Host, null, 4));
          return hosts.Host;
        }
     }
  }
});

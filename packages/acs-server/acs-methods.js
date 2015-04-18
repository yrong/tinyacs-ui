Meteor.methods({
  // TODO Remove this method
  'loadCpe': function(orgId, sn) {
    var wanPath, data = {};

    if (sn == null || !_.isString(sn) || sn.trim().length == 0) {
      throw new Meteor.Error(400, 'Missing FSAN');
    }

    wanPath = AcsNbi.Utils.getWanConnectionPath(orgId, {
      'serialNumber': sn
    });

    if (wanPath) data.wanPath = wanPath;
    return data;
  },

  'unloadCpe': function(sn) {
    // TODO Tell ACS Server not interested in CPE <sn>
  },

  getDialPlan: function(orgId) {
    try {
      this.unblock();
      var dialPlanUrlPrefix = AcsNbi.nbiPrefix() + 'cc/dial-plan';
      return HTTP.call('GET', dialPlanUrlPrefix + '?orgId=' + orgId).data;
    } catch (error) {
      throw AcsNbi.buildMeteorError(error);
    }
  },

  getFiles: function(orgId, serialNumber) {
    this.unblock();
    var cpeId;
    if (serialNumber) {
      cpeId = Utils.buildCpeId(serialNumber);
    }
    return AcsNbi.getFiles.call(this, orgId, cpeId, 'Configuration File').concat(AcsNbi.getFiles.call(this, orgId, cpeId, 'SIP Configuration File'));
  },

  getCommunicationLog: function(logId) {
    try {
      var communicationLogPrefix = AcsNbi.nbiPrefix() + 'cc/device-cwmp-logs';
      return HTTP.call('GET', communicationLogPrefix + '/' + logId).data;
    } catch (error) {
      throw AcsNbi.buildMeteorError(error);
    }
  },

});

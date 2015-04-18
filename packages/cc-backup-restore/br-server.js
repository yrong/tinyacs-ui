Meteor.methods({
  backup: function(orgId, serialNumber, description, userName) {
    var cpeId = Utils.buildCpeId(serialNumber);
    return AcsNbi.configBackup.call(this, orgId, cpeId, userName, description).data;
  },

  restore: function(orgId, serialNumber, fileId) {
    var cpeId = Utils.buildCpeId(serialNumber);
    return AcsNbi.configRestore.call(this, orgId, cpeId, fileId).data;
    /*return {
      "startTime": "2014-10-07T02:52:33+00:00",
      "completeTime": "2014-10-07T02:52:33+00:00",
    };
    throw new Meteor.Error(500, 'error', 'error');*/
  },
});

Meteor.methods({
  getConfigurationCount: function(orgId) {
    return {count:AcsNbi.getNetOpFileCountByType.call(this, orgId, "Configuration File").count + AcsNbi.getNetOpFileCountByType.call(this, orgId, "SIP Configuration File").count} ;
  },

  getConfigurationPage: function(orgId, pageNumber, pageLength) {
    return AcsNbi.getNetOpFilesByType.call(this, orgId, "Configuration File", pageNumber, pageLength).concat(AcsNbi.getNetOpFilesByType.call(this, orgId, "SIP Configuration File", pageNumber, pageLength));
  },

  deleteConfiguration: function(orgId, configurationId) {
    return AcsNbi.deleteNetOpFile.call(this, orgId, configurationId);
  },

  getConfigurationByNameType: function(orgId, name,type) {
    return AcsNbi.getNetOpFileByTypeAndName.call(this, orgId, type, name);
  },

  createConfiguration: function(orgId, configuration) {
    return AcsNbi.createNetOpFile.call(this, orgId, configuration);
  },

  updateConfiguration: function(orgId, configuration) {
    return AcsNbi.updateNetOpFile.call(this, orgId, configuration);
  }
});

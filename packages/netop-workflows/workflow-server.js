Meteor.methods({
  getWorkflowSummary: function(orgId) {
    return AcsNbi.getWorkflowSummary.call(this, orgId);
  },

  getWorkflowExecLogs: function(workflowId, pageNumber, pageLength, state) {
    return AcsNbi.getWorkflowExeLogs.call(this, workflowId, pageNumber, pageLength, state);
  },

  deleteWorkflow: function(workflowId) {
    return AcsNbi.deleteWorkflow.call(this, workflowId);
  },

  suspendWorkflow: function(workflowId) {
    return AcsNbi.suspendWorkflow.call(this, workflowId);
  },

  resumeWorkflow: function(workflowId) {
    return AcsNbi.resumeWorkflow.call(this, workflowId);
  },

  getWorkflowById: function(workflowId, orgId) {
    return AcsNbi.getWorkflowById.call(this, workflowId, orgId);
  }
});

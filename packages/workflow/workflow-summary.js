var keyWorkflowSummaryError = 'workflowSummary.error';
var keyWorkflowSummaryResult = 'workflowSummary.result';

var orgId, currentWorkflow;

var suspendedState = "Suspended";
var completedState = "Completed";

var cleanupSession = function() {
  Session.set(keyWorkflowSummaryError);
  Session.set(keyWorkflowSummaryResult);
};

Template.workflowSummary.created = function() {
  orgId = Utils.getOrgId();
  // Cleanup session
  cleanupSession();

  Meteor.call('getWorkflowSummary', orgId, function(error, result) {
    if (error) {
      Session.set(keyWorkflowSummaryError, error.reason);
      return;
    }
    Session.set(keyWorkflowSummaryResult, result);
  });
};

Template.workflowSummary.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.workflowSummary.destroyed = function() {
  // Cleanup session
  cleanupSession();
};

var WorkflowStatusController = RouteController.extend({
  template: 'workflowStatus',
  data: function() {
    var res = Session.get('selectedWorkflow');
    res['completeCount'] = (parseInt(res['successCount']) + parseInt(res['failureCount'])).toString();

    return res;
  }
});

Router.map(function() {
  this.route('workflowStatus', {
    path: '/network-operations-workflows-status',
    controller: WorkflowStatusController
  });
});

Template.workflowSummary.helpers({
  ready: function() {
    return Session.get(keyWorkflowSummaryError) != null || Session.get(keyWorkflowSummaryResult) != null;
  },

  error: function() {
    return Session.get(keyWorkflowSummaryError);
  }
});

Template.workflowTable.helpers({
  workflow: function() {
    return Session.get(keyWorkflowSummaryResult);
  },

  time: function(timeValue) {
    if (timeValue == null)
      return 'N/A';
    return moment(timeValue).format("MM/DD/YYYY hh:mm:ss A");;
  },

  isSuspendedState: function() {
    return this['state'] === suspendedState;
  }
});

Template.workflowSummary.events({
  'click button[id="btn-newWorkflow"]': function(event) {
    Router.go('workflowNew');
  }
});

Template.workflowTable.events({
  'click .fa-eye': function(event) {
    event.stopPropagation();
    Session.set('selectedWorkflow', this);
    Router.go('workflowStatus');
  },

  'mouseover .fa-eye': function(event) {
    $(event.currentTarget).addClass('blue');
  },

  'mouseout .fa-eye': function(event) {
    $(event.currentTarget).removeClass('blue');
  },

  'mouseover .fa-ban': function(event) {
    var element = $(event.currentTarget);
    if (this['state'] === completedState || this['state'] === suspendedState) { //prohibite suspend
      element.prop('title', 'Workflow has already completed thus cannot be suspended!');
      return;
    }
    element.prop('title', 'Suspend');
    element.addClass('red');
  },

  'mouseover .fa-check-circle-o,.fa-trash-o': function(event) {
    $(event.currentTarget).addClass('red');
  },

  'mouseout .fa-ban,.fa-check-circle-o,.fa-trash-o': function(event) {
    $(event.currentTarget).removeClass('red');
  },

  'click .fa-ban,.fa-check-circle-o,.fa-trash-o': function(event) {
    event.stopPropagation();
    var confirmDialog = document.getElementById("confirmDialog");
    var element = $(event.currentTarget);
    currentWorkflow = this;
    currentWorkflow['workflowIndex'] = element.closest('tr').index();

    if (element.hasClass('fa-ban')) {
      if (currentWorkflow['state'] === completedState || currentWorkflow['state'] === suspendedState) { //prohibite suspend
        return;
      }
      confirmDialog.children[3].innerHTML = 'Are you sure you want to Suspend the workflow ' + '"' + this['name'] + '"' + '?';
      currentWorkflow['operationType'] = 0;
    } else if (element.hasClass('fa-check-circle-o')) {
      confirmDialog.children[3].innerHTML = 'Are you sure you want to Resume the workflow ' + '"' + this['name'] + '"' + '?';
      currentWorkflow['operationType'] = 1;
    } else {
      confirmDialog.children[3].innerHTML = 'Are you sure you want to Delete the workflow ' + '"' + this['name'] + '"' + '?';
      currentWorkflow['operationType'] = 2;
    }

    $(confirmDialog).css('display', 'block');
  },

  'click .cancel': function(event) {
    $(event.currentTarget).parent().css('display', 'none');
  },

  'click .confirm': function(event) {
    var parent = $(event.currentTarget).parent();
    parent.css('display', 'none');
    if (currentWorkflow['operationType'] === 0) {
      //suspend workflow
      Meteor.call('suspendWorkflow', currentWorkflow['_id'], function(error, result) {
        if (error) {
          Session.set(keyWorkflowSummaryError, error.reason);
          return;
        }
        Session.set(keyWorkflowSummaryError, null);
        var array = Session.get(keyWorkflowSummaryResult);
        array[currentWorkflow['workflowIndex']]['state'] = suspendedState;
        Session.set(keyWorkflowSummaryResult, array);
      });
    } else if (currentWorkflow['operationType'] === 1) {
      //resume workflow
      Meteor.call('resumeWorkflow', currentWorkflow['_id'], function(error, result) {
        if (error) {
          Session.set(keyWorkflowSummaryError, error.reason);
          return;
        }
        Meteor.call('getWorkflowById', currentWorkflow['_id'], orgId, function(error, result) {
          if (error) {
            Session.set(keyWorkflowSummaryError, error.reason);
            return;
          }
          Session.set(keyWorkflowSummaryError, null);
          var array = Session.get(keyWorkflowSummaryResult);
          array[currentWorkflow['workflowIndex']]['state'] = result['state'];
          Session.set(keyWorkflowSummaryResult, array);
        });
      });
    } else {
      //delete workflow
      console.log(currentWorkflow['workflowIndex']);
      Meteor.call('deleteWorkflow', currentWorkflow['_id'], function(error, result) {
        if (error) {
          Session.set(keyWorkflowSummaryError, error.reason);
          return;
        }
        Session.set(keyWorkflowSummaryError, null);
        var array = Session.get(keyWorkflowSummaryResult);
        array.splice(currentWorkflow['workflowIndex'], 1);
        Session.set(keyWorkflowSummaryResult, array);
      });
    }
  },

  'click .workflow-entry': function(event) {
	Session.set('workFlow.currentId',this._id);
    Router.go('/netop-workflows/' + this._id);
  },
});

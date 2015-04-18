var keyWorkflowStatusError = 'workflowsStatus.error';
var keyWorkflowStatusResult = 'workflowsStatus.result';
var keyWorkflowStatusCount = "workflowsStatus.count";

var pageInfo = {
  'pageLength': 10,
  'currentPageNumber': 1,
  'maxPageNumber': 0,
  'navCount': 5
};
var workflowId;

var cleanupSession = function() {
  Session.set(keyWorkflowStatusError, null);
  Session.set(keyWorkflowStatusResult, null);
  Session.set(keyWorkflowStatusCount, null);
};

var disablePagenation = function(element) {
  element.addClass('disabled');
};

var enablePagenation = function(element) {
  element.removeClass('disabled');
};

var getOnePage = function() {
  cleanupSession();

  Meteor.call('getWorkflowsCount', workflowId, function(error, result) {
    if (error) {
      Session.set(keyWorkflowStatusError, error.reason);
      return;
    }
    Session.set(keyWorkflowStatusCount, result.count);
  });

  Meteor.call('getWorkflowStatus', workflowId, pageInfo.currentPageNumber, pageInfo.pageLength, function(error, result) {
    if (error) {
      Session.set(keyWorkflowStatusError, error.reason);
      return;
    }
    Session.set(keyWorkflowStatusResult, result);
  });
};

Template.workflowStatus.created = function() {
  var orgId = Utils.getOrgId();
  workflowId = this.data['_id'];
  pageInfo.currentPageNumber = 0;
  Meteor.call('getWorkflowsCount', workflowId, function(error, result) {
    if (error) {
      Session.set(keyWorkflowStatusError, error.reason);
      return;
    }
    if (result.count > 0)
      pageInfo.currentPageNumber = 1;
  });
  getOnePage();
};

Template.workflowStatus.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.workflowStatus.destroyed = function() {
  cleanupSession();
};

Template.statusTable.rendered = function() {
  SmartAdmin.pageSetup();
  $('#' + pageInfo.currentPageNumber).addClass('active');

  if (pageInfo.currentPageNumber <= 1)
    disablePagenation($('#pre'));
  if (pageInfo.currentPageNumber === pageInfo.maxPageNumber)
    disablePagenation($('#post'));
};

Template.workflowStatus.helpers({
  devicesTooltip: function(count) {
    return count + ' ' + 'devices';
  },

  devicesPercent: function(count) {
    if (this['totalCount'] === 0)
      return '0%';
    return Math.round(count / parseInt(this['totalCount']) * 100) + '%';
  },

  inProgressDevicesTooltip: function() {
    return Session.get(keyWorkflowStatusCount) - parseInt(this['completeCount']) + ' ' + 'devices';
  },

  inProgressDevicesPercent: function() {
    var count = Session.get(keyWorkflowStatusCount) - parseInt(this['completeCount']);
    return Math.round(count / parseInt(this['totalCount']) * 100) + '%';
  },

  ready: function() {
    return Session.get(keyWorkflowStatusError) != null || Session.get(keyWorkflowStatusResult) != null;
  },

  error: function() {
    return Session.get(keyWorkflowStatusError);
  }
});

Template.statusTable.helpers({
  result: function() {
    return Session.get(keyWorkflowStatusResult);
  },

  pageNumbers: function() {
    var count = Math.ceil(Session.get(keyWorkflowStatusCount) / pageInfo.pageLength);
    pageInfo.maxPageNumber = count;
    if (pageInfo.currentPageNumber === 0)
      return;

    var index = Math.ceil(pageInfo.currentPageNumber / 5);
    var lower = (index - 1) * pageInfo.navCount + 1;
    var upper = Math.min(index * pageInfo.navCount, count);
    var array = [];
    
    for (var i = lower; i <= upper; i++) {
      array.push({
        'pageNumber': i,
      });
    }

    return array;
  },

  startNumber: function() {
    if (pageInfo.currentPageNumber === 0)
      return 0;
    return (pageInfo.currentPageNumber - 1) * pageInfo.pageLength + 1;
  },

  endNumber: function() {
    if (pageInfo.currentPageNumber === 0)
      return 0;
    return (pageInfo.currentPageNumber - 1) * pageInfo.pageLength + Session.get(keyWorkflowStatusResult).length;
  },

  time: function(timeValue) {
    if (timeValue == null)
      return 'N/A';
    return moment(timeValue).format("MM/DD/YYYY hh:mm:ss A");
  },

  count: function() {
    return Session.get(keyWorkflowStatusCount);
  }
});


Template.statusTable.events({
  'click li': function(event) {
    var element = $(event.currentTarget);
    var id = element.prop('id');

    if (id === 'pre') {
      if (pageInfo.currentPageNumber <= 1)
        return;
      pageInfo.currentPageNumber--;
    } else if (id === 'post') {
      if (pageInfo.currentPageNumber === pageInfo.maxPageNumber)
        return;
      pageInfo.currentPageNumber++;
    } else {
      pageInfo.currentPageNumber = parseInt(id);
    }
    getOnePage();
  }
});

var keyWorkflowStatusError = 'workflowsStatus.error';
var keyWorkflowExecLogsResult = 'workflowsStatus.execLogs.result';
var keyWorkflowStatusCountSummary = "workflowsStatus.count.summary";
var keyWorkflowStatusName = "workflowsStatus.name";
var keyWorkflowRefreshFlag = 'workflowsStatus.refresh.flag';

var allSessionNames = [keyWorkflowStatusError, keyWorkflowExecLogsResult, keyWorkflowStatusCountSummary, keyWorkflowStatusName];
var pageInfo = {
  'pageLength': 10,
  'currentPageNumber': 1,
  'maxPageNumber': 0,
  'navCount': 5
};
var stateCountMap = {
  'Failed': 'failureCount',
  'Succeeded': 'successCount',
  'In Progress': 'inProgressCount',
  'Pending': 'pendingCount'
};
var workflowId, orgId, state;

var cleanupSession = function(sessionNames) {
  _.each(sessionNames, function(name) {
    Session.set(name, null);
  })
};

var getOnePage = function() {
  cleanupSession([keyWorkflowStatusError, keyWorkflowExecLogsResult, keyWorkflowStatusCountSummary]);

  Meteor.call('getWorkflowById', workflowId, orgId, function(error, result) {
    if (error) {
      Session.set(keyWorkflowRefreshFlag, false);
      Session.set(keyWorkflowStatusError, error.reason);
      return;
    }
    if (result['successCount'] != null && result['failureCount'] != null) {
      result['completeCount'] = result['successCount'] + result['failureCount'];
    }
    Session.set(keyWorkflowStatusCountSummary, result);
    var pageTotalCount = (state != null) ? (result[stateCountMap[state]]) : result['totalCount'];
    if (pageTotalCount === 0) {
      pageInfo.currentPageNumber = 0;
    }
    if ((state != null) && (result[stateCountMap[state]] == null || result[stateCountMap[state]] === 0)) {
      Session.set(keyWorkflowExecLogsResult, []);
    } else {
      Meteor.call('getWorkflowExecLogs', workflowId, pageInfo.currentPageNumber, pageInfo.pageLength, state, function(error, result) {
        if (error) {
          Session.set(keyWorkflowRefreshFlag, false);
          Session.set(keyWorkflowStatusError, error.reason);
          return;
        }
        Session.set(keyWorkflowExecLogsResult, result);
      });
    }
    Session.set(keyWorkflowRefreshFlag, false);
  });
};

var initFilterPage = function(targetState) {
  state = targetState;
  pageInfo.currentPageNumber = 1;
  Session.set(keyWorkflowRefreshFlag, true);
};

var WorkflowStatusController = RouteController.extend({
  template: 'workflowStatus',
  refreshFlag: keyWorkflowRefreshFlag
});

Router.map(function() {
  this.route('workflowStatus', {
    path: '/netop-workflows-status/:workflowName',
    controller: WorkflowStatusController
  });
});

/*******************************************Template workflowStatus*******************************************/
Template.workflowStatus.created = function() {
  orgId = Utils.getOrgId();
  cleanupSession(allSessionNames);
  state = null;
  pageInfo.currentPageNumber = 1;
  workflowId = Router.current().params.query['workflowId'];
  Session.set(keyWorkflowStatusName, Router.current().params.workflowName);
  Session.set(keyWorkflowRefreshFlag, true);
  this.autorun(function() {
    if (Session.equals(keyWorkflowRefreshFlag, true)) {
      getOnePage();
    }
  });
};

Template.workflowStatus.destroyed = function() {
  cleanupSession(allSessionNames);
};

Template.workflowStatus.helpers({
  execLogsReady: function() {
    return Session.get(keyWorkflowStatusError) != null || Session.get(keyWorkflowExecLogsResult) != null;
  },

  countSummaryReady: function() {
    return Session.get(keyWorkflowStatusError) != null || Session.get(keyWorkflowStatusCountSummary) != null;
  },

  error: function() {
    return Session.get(keyWorkflowStatusError);
  },

  devicesTooltip: function(countName) {
    var countSummary = Session.get(keyWorkflowStatusCountSummary);
    var count = null;
    if (countSummary != null) {
      count = countSummary[countName];
    }
    return (count == null) ? 'N/A' : (count + ' device(s)');
  },

  devicesPercent: function(countName) {
    var countSummary = Session.get(keyWorkflowStatusCountSummary);
    if (countSummary == null)
      return;
    var count = countSummary[countName];
    var totalCount = countSummary['totalCount'];
    if (count == null || totalCount == null)
      return 'N/A';
    if (count === 0 || totalCount === 0)
      return '0%';
    return Math.round(count / totalCount * 100) + '%';
  },

  name: function() {
    return Session.get(keyWorkflowStatusName);
  }
});

Template.workflowStatus.events({
  'click .workflow-status': function(event) {
    var currentElement = $(event.currentTarget);
    var currentFilter = currentElement.find('i');
    var allFilters = currentElement.parent().find(".fa-filter");
    var vis = currentFilter.css('display');

    // hide all filter icons
    _.each(allFilters, function(filter) {
      $(filter).css('display', 'none');
    });

    var toggleFilter = function(targetState) {
      // toggle the filter icon
      if (vis == 'inline') {
        currentFilter.css('display', 'none');
        targetState = null;
      } else {
        currentFilter.css('display', 'inline');
      }
      initFilterPage(targetState);
    };

    var id = currentElement.attr('id');
    switch (id) {
      case "head-failed":
        toggleFilter("Failed");
        break;
      case "head-succeeded":
        toggleFilter("Succeeded");
        break;
      case "head-inprogress":
        toggleFilter("In Progress");
        break;
      case "head-pending":
        toggleFilter("Pending");
        break;
    }
  }
});
/*******************************************Template workflowStatus*******************************************/


/********************************************Template statusTable********************************************/
Template.statusTable.rendered = function() {
  $('#' + pageInfo.currentPageNumber).addClass('active');
};

Template.statusTable.helpers({
  result: function() {
    return Session.get(keyWorkflowExecLogsResult);
  },

  pageNumbers: function() {
    var countSummary = Session.get(keyWorkflowStatusCountSummary);
    if (countSummary == null)
      return;
    var pageTotalCount = (state != null) ? (countSummary[stateCountMap[state]]) : countSummary['totalCount'];
    var halfNavCount = Math.floor(pageInfo.navCount / 2);
    var array = [];
    var lower, upper;

    pageInfo.maxPageNumber = Math.ceil(pageTotalCount / pageInfo.pageLength);

    if (pageInfo.maxPageNumber <= pageInfo.navCount) {
      lower = 1;
      upper = pageInfo.maxPageNumber;
    } else {
      if (pageInfo.currentPageNumber <= (halfNavCount + 1)) {
        lower = 1;
        upper = pageInfo.navCount;
      } else if (pageInfo.currentPageNumber >= (pageInfo.maxPageNumber - halfNavCount)) {
        lower = pageInfo.maxPageNumber - pageInfo.navCount + 1;
        upper = pageInfo.maxPageNumber;
      } else {
        lower = pageInfo.currentPageNumber - halfNavCount;
        upper = pageInfo.currentPageNumber + halfNavCount;
      }
    }

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
    return (pageInfo.currentPageNumber - 1) * pageInfo.pageLength + Session.get(keyWorkflowExecLogsResult).length;
  },

  time: function(timeValue) {
    if (timeValue == null)
      return 'N/A';
    return moment(timeValue).format(Utils.timeFormat);
  },

  state: function() {
    if (this['state'] !== 'Failed')
      return this['state'];
    return this['failureSummary'] == null ? 'Failed' : ('Failed' + '\n' + this['failureSummary']);
  },

  count: function() {
    var countSummary = Session.get(keyWorkflowStatusCountSummary);
    if (countSummary == null || countSummary.totalCount == null) {
      return 0;
    }
    return (state != null) ? (countSummary[stateCountMap[state]]) : (countSummary['totalCount']);
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
    } else if (id === 'first') {
      if (pageInfo.currentPageNumber <= 1)
        return;
      pageInfo.currentPageNumber = 1;
    } else if (id === 'last') {
      if (pageInfo.currentPageNumber === pageInfo.maxPageNumber)
        return;
      pageInfo.currentPageNumber = pageInfo.maxPageNumber;
    } else {
      var expectedNumber = parseInt(id);
      if (pageInfo.currentPageNumber === expectedNumber)
        return;
      pageInfo.currentPageNumber = expectedNumber;
    }
    Session.set(keyWorkflowRefreshFlag, true);
  }
});
/********************************************Template statusTable********************************************/

var keyConfigurationSummaryError = "netop.configurationSummary.error";
var keyConfigurationSummaryResult = "netop.configurationSummary.result";
var keyConfigurationSummaryCount = "netop.configurationSummary.count";

var orgId, currentConfiguration;

var ConfigurationNewController = RouteController.extend({
  template: 'configurationNew'
});

Router.map(function() {
  this.route('configurationNew', {
    path: '/netop-configurationManagement-upload',
    controller: ConfigurationNewController
  });

  this.route('netop-configurationManagement', {
    path: '/netop-configurationManagement',
    controller: 'ConfigurationManagementController'
  });
  
});

var pageInfo = {
  'pageLength': 20,
  'currentPageNumber': 1,
  'maxPageNumber': 0,
  'navCount': 5
};

var cleanupSession = function() {
  Session.set(keyConfigurationSummaryError, null);
  Session.set(keyConfigurationSummaryResult, null);
};

var disablePagenation = function(element) {
  element.addClass('disabled');
};

var enablePagenation = function(element) {
  element.removeClass('disabled');
};


var getOnePage = function() {
  var dealCallError = function(error) {
    var configurationCount = Session.get(keyConfigurationSummaryError);
    var configurationSummary = Session.get(keyConfigurationSummaryResult);
    if (configurationCount == null) {
      pageInfo.currentPageNumber = 0;
      Session.set(keyConfigurationSummaryCount, 0);
    }
    if (configurationSummary == null) {
      Session.set(keyConfigurationSummaryResult, []);
    }
    Session.set(keyConfigurationSummaryError, error.reason);
  };
  cleanupSession();

  Meteor.call('getConfigurationCount', orgId, function(error, result) {
    if (error) {
      dealCallError(error);
      return;
    }
    if (result.count === 0) {
      pageInfo.currentPageNumber = 0;
    }
    var maxPageNumber = Math.ceil(result.count / pageInfo.pageLength);
    if (pageInfo.currentPageNumber > maxPageNumber) {
      pageInfo.currentPageNumber = maxPageNumber;
    }
    Session.set(keyConfigurationSummaryCount, result.count);
    Meteor.call('getConfigurationPage', orgId, pageInfo.currentPageNumber, pageInfo.pageLength, function(error, result) {
      if (error) {
        dealCallError(error);
        return;
      }
      Session.set(keyConfigurationSummaryResult, result);
    });
  });
};

/********************************************configurationSummary Template********************************************/
Template.configurationSummary.created = function() {
  cleanupSession();
  orgId = Utils.getOrgId();
  pageInfo.currentPageNumber = 1;
  getOnePage();
};

Template.configurationSummary.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.configurationSummary.destroyed = function() {
  cleanupSession();
};

Template.configurationSummary.helpers({
  ready: function() {
    return Session.get(keyConfigurationSummaryError) != null || Session.get(keyConfigurationSummaryResult) != null;
  },

  error: function() {
    return Session.get(keyConfigurationSummaryError);
  }
});

Template.configurationSummary.events({
  'click #btn-newConfiguration': function(event) {
    Router.go('configurationNew');
  }
});
/********************************************configurationSummary Template********************************************/


/*********************************************configurationTable Template*********************************************/
Template.configurationTable.rendered = function() {
  $('#' + pageInfo.currentPageNumber).addClass('active');
};

Template.configurationTable.helpers({
  configuration: function() {
    return Session.get(keyConfigurationSummaryResult);
  },

  pageNumbers: function() {
    var lower, upper;
    var halfNavCount = Math.floor(pageInfo.navCount / 2);
    var array = [];

    pageInfo.maxPageNumber = Math.ceil(Session.get(keyConfigurationSummaryCount) / pageInfo.pageLength);

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
    return (pageInfo.currentPageNumber - 1) * pageInfo.pageLength + Session.get(keyConfigurationSummaryResult).length;
  },

  count: function() {
    return Session.get(keyConfigurationSummaryCount);
  },

  type_: function() {
    return this.type === 'Configuration File' ? 'Golden Configuration File' : this.type;
  }
});

Template.configurationTable.events({
  'click .fa-trash-o': function(event) {
    event.stopPropagation();
    var confirmDialog = $('#deleteConfirmDialog');
    currentConfiguration = this;
    confirmDialog.find('span').html('Are you sure you want to Delete the configuration ' + '"' + this['name'] + '"' + '?');
    confirmDialog.css('display', 'block');
    confirmDialog.find('#btn-cancelDeleteDialog')[0].focus();
  },

  'click #btn-cancelDeleteDialog': function(event) {
    $(event.currentTarget).parent().css('display', 'none');
  },

  'click #btn-confirmDeleteDialog': function(event) {
    $(event.currentTarget).parent().css('display', 'none');
    Session.set(keyConfigurationSummaryError, null);
    //delete configuration
    Meteor.call('deleteConfiguration', orgId, currentConfiguration['_id'], function(error, result) {
      if (error) {
        Session.set(keyConfigurationSummaryError, error.reason);
        return;
      }
      getOnePage();
    });
  },

  'click li': function(event) {
    var id = $(event.currentTarget).prop('id');

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
    getOnePage();
  }
});
/*********************************************configurationTable Template*********************************************/

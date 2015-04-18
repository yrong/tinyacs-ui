var keySWImageSummaryError = "netop.swImageSummary.error";
var keySWImageSummaryResult = "netop.swImageSummary.result";
var keySWImageSummaryCount = "netop.swImageSummary.count";

var orgId, currentSWImage;

var pageInfo = {
  'pageLength': 20,
  'currentPageNumber': 1,
  'maxPageNumber': 0,
  'navCount': 5
};

var cleanupSession = function() {
  Session.set(keySWImageSummaryError, null);
  Session.set(keySWImageSummaryResult, null);
};

var getOnePage = function() {
  var dealCallError = function(error) {
    var swImageCount = Session.get(keySWImageSummaryCount);
    var swImageSummary = Session.get(keySWImageSummaryResult);
    if (swImageCount == null) {
      pageInfo.currentPageNumber = 0;
      Session.set(keySWImageSummaryCount, 0);
    }
    if (swImageSummary == null) {
      Session.set(keySWImageSummaryResult, []);
    }
    Session.set(keySWImageSummaryError, error.reason);
  };

  cleanupSession();

  Meteor.call('getSWImageCount', orgId, function(error, result) {
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
    Session.set(keySWImageSummaryCount, result.count);
    Meteor.call('getSWImagePage', orgId, pageInfo.currentPageNumber, pageInfo.pageLength, function(error, result) {
      if (error) {
        dealCallError(error);
        return;
      }
      Session.set(keySWImageSummaryResult, result);
    });
  });
};

/********************************************swImageSummary Template********************************************/
Template.swImageSummary.created = function() {
  cleanupSession();
  orgId = Utils.getOrgId();
  pageInfo.currentPageNumber = 1;
  getOnePage();
};

Template.swImageSummary.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.swImageSummary.destroyed = function() {
  cleanupSession();
};

Template.swImageSummary.helpers({
  ready: function() {
    return Session.get(keySWImageSummaryError) != null || Session.get(keySWImageSummaryResult) != null;
  },

  error: function() {
    return Session.get(keySWImageSummaryError);
  }
});

Template.swImageSummary.events({
  'click #btn-newSWImage': function(event) {
    Router.go('swImageNew');
  }
});
/********************************************swImageSummary Template********************************************/


/*********************************************swImageTable Template*********************************************/
Template.swImageTable.rendered = function() {
  $('#' + pageInfo.currentPageNumber).addClass('active');
};

Template.swImageTable.helpers({
  swImage: function() {
    return Session.get(keySWImageSummaryResult);
  },

  pageNumbers: function() {
    var lower, upper;
    var halfNavCount = Math.floor(pageInfo.navCount / 2);
    var array = [];

    pageInfo.maxPageNumber = Math.ceil(Session.get(keySWImageSummaryCount) / pageInfo.pageLength);

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
    return (pageInfo.currentPageNumber - 1) * pageInfo.pageLength + Session.get(keySWImageSummaryResult).length;
  },

  count: function() {
    return Session.get(keySWImageSummaryCount);
  }
});


Template.swImageTable.events({
  'click .fa-trash-o': function(event) {
    event.stopPropagation();
    var confirmDialog = $('#deleteConfirmDialog');
    currentSWImage = this;
    confirmDialog.find('span').html('Are you sure you want to Delete the Software Image ' + '"' + this['name'] + '"' + '?');
    confirmDialog.css('display', 'block');
    confirmDialog.find('#btn-cancelDeleteDialog')[0].focus();
  },

  'click #btn-cancelDeleteDialog': function(event) {
    $(event.currentTarget).parent().css('display', 'none');
  },

  'click #btn-confirmDeleteDialog': function(event) {
    $(event.currentTarget).parent().css('display', 'none');
    Session.set(keySWImageSummaryError, null);

    //delete swImage
    Meteor.call('deleteSWImage', orgId, currentSWImage['_id'], function(error, result) {
      if (error) {
        Session.set(keySWImageSummaryError, error.reason);
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
/*********************************************swImageTable Template*********************************************/

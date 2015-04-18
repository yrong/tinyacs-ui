var keyUnlinkDeviceError = 'UnlinkDevice.error';
var keyUnlinkDeviceResult = 'UnlinkDevice.result';
var keyUnlinkDeviceCount = "UnlinkDevice.count";


var pageInfo = {
  'pageLength': 10,
  'currentPageNumber': 1,
  'maxPageNumber': 0,
  'navCount': 5
};

var orgId, cpeId;

var cleanupSession = function() {
  Session.set(keyUnlinkDeviceError, null);
  Session.set(keyUnlinkDeviceResult, null);
  Session.set(keyUnlinkDeviceCount, null);
};


var disablePagenation = function(element) {
  element.addClass('disabled');
};

var enablePagenation = function(element) {
  element.removeClass('disabled');
};

var getOnePage = function() {
  cleanupSession();
  Meteor.call('getUnlinkDeviceCount', orgId, cpeId, function(error, result) {
    if (Session.get(keyUnlinkDeviceError) != null)
      return;
    if (error) {
      Session.set(keyUnlinkDeviceError, error.reason);
      return;
    }
    if (result.count === 0) {
      pageInfo.currentPageNumber = 0;
    }
    Session.set(keyUnlinkDeviceCount, result.count);
  });

  Meteor.call('getUnlinkDevice', orgId, cpeId, pageInfo.currentPageNumber, pageInfo.pageLength, function(error, result) {
    if (Session.get(keyUnlinkDeviceError) != null)
      return;
    if (error) {
      Session.set(keyUnlinkDeviceError, error.reason);
      return;
    }
    Session.set(keyUnlinkDeviceResult, result);
  });
};

Template.UnlinkDevice.created = function() {
  orgId = Utils.getOrgId();
  cpeId = Utils.getCpeId();
  pageInfo.currentPageNumber = 1;
  getOnePage();
};

Template.UnlinkDevice.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.UnlinkDevice.destroyed = function() {
  cleanupSession();
};

Template.UnlinkDeviceTable.rendered = function() {
  $('#' + pageInfo.currentPageNumber).addClass('active');

  if (pageInfo.currentPageNumber <= 1)
    disablePagenation($('#pre'));
  if (pageInfo.currentPageNumber === pageInfo.maxPageNumber)
    disablePagenation($('#post'));

};

Template.UnlinkDevice.helpers({
  ready: function() {
    var ready = Session.get(keyUnlinkDeviceError) != null || (Session.get(keyUnlinkDeviceResult) != null && (Session.get(
      keyUnlinkDeviceCount) != null));
    return ready;
  },

  error: function() {
    return Session.get(keyUnlinkDeviceError);
  }
});

Template.UnlinkDeviceTable.helpers({
  result: function() {
    return Session.get(keyUnlinkDeviceResult);
  },

  pageNumbers: function() {

    var lower, upper;
    var halfNavCount = Math.floor(pageInfo.navCount / 2);
    var array = [];

    pageInfo.maxPageNumber = Math.ceil(Session.get(keyUnlinkDeviceCount) / pageInfo.pageLength);

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
    return (pageInfo.currentPageNumber - 1) * pageInfo.pageLength + Session.get(keyUnlinkDeviceResult).length;
  },

  timestamp: function(field) {
    if (this[field] == null)
      return 'N/A';
    return moment(this[field].$date).format("MM/DD/YYYY hh:mm:ss A");
  },

  summary: function() {
    if (this.summary == null)
      return;
    var result = '';
    for (key in this.summary) {
      result = result.concat(key + ' ' + ':' + ' ' + this.summary[key]) + '\n';
    }
    return result.slice(0, result.length - 1);
  },

  count: function() {
    return Session.get(keyUnlinkDeviceCount);
  }
});


Template.UnlinkDeviceTable.events({
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
    getOnePage();
  }
});

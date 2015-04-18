
var orgId;

var fileserverError = 'fileserver.error';

var fileserverResult = 'fileserver.result';

fileserverSelected = 'fileserver.selected';

var FileServerController = RouteController.extend({
    template: 'fileserver'
});

var removeItemById = function(arr, id) {
    return _.reject(arr, function(item) {
        return item._id === id;
    });
};

Router.map(function() {
  this.route('file-server', {
    path: '/file-server',
    controller: FileServerController
  });
});

Template.fileserver.created = function() {
  orgId = Utils.getOrgId();

  Meteor.call('getFileServer', orgId, function(error, result) {
    if (error) {
      Session.set(fileserverError, error['reason']);
    } else {
      Session.set(fileserverResult, result);
    }
  });
};

Template.fileserver.rendered = function() {
  SmartAdmin.pageSetup();
};



Template.fileserver.destroyed = function() {
  Session.set(fileserverResult);
  Session.set(fileserverError);
};

var fileservers = function() {
    var org = Session.get(fileserverResult);
    var fileservers = [],fileserver;
    if(org&&org.externalImageServer) {
      fileserver = org.externalImageServer;
      fileserver._id = org._id;
      fileservers.push(fileserver);
    }
    return fileservers;
};

Template.fileserver.helpers({
  ready: function () {
    return !Session.get(fileserverResult) || !Session.get(fileserverError);
  },

  error: function() {
    return Session.get(fileserverError);
  },

  fileservers: fileservers,

  noserverexist: function() {
    var servers = fileservers();
    if(servers.length>0){
      return false;
    }
    return true;
  } 
});

Template.fileserver.events({

  'click button[type="submit"]': function(event) {
        event.preventDefault();
        Session.set(fileserverSelected, null);
        Router.go('file-server-detail-new');
  },

  'click .fileserver': function(event) {
    var $target = $(event.target);
    Session.set(fileserverSelected, this);
    if ($target.is('.fa-trash-o')) {
      var confirmDialog = document.getElementById("confirmDialog");
      $(confirmDialog).css('display', 'block');
    } else {
      Router.go('/file-server-detail/' + this._id);
    }
  },

  'click .confirm': function(event) {
    var parent = $(event.currentTarget).parent();
    parent.css('display', 'none');
    var id = Session.get(fileserverSelected)._id;
    Meteor.call('fileServerDelete', orgId, id, function(error, result) {
      if (!error) {
        Session.set(fileserverResult, removeItemById(Session.get(fileserverResult), id));
        Router.go('file-server');
      } else {
        Session.set(fileserverError, error.reason);
      }
    });
  },


  'click .cancel': function(event) {
    $(event.currentTarget).parent().css('display', 'none');
  }
});

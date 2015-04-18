var BR_KEY_CURRENT_PRE = "br.current";
var BR_KEY_BRESULT_PRE = "br.backupResults";
var BR_KEY_RRESULT_PRE = "br.restoreResults";
var BR_KEY_FILES_PRE = "br.files";
var BR_KEY_BLOADING_PRE = "br.backupLoading";
var BR_KEY_RLOADING_PRE = "br.restoreLoading";
var BR_KEY_SELECTED_PRE = "br.selected";

var PAGE_BACKUP = "backup";
var PAGE_RESTORE = "restore";

var serialNumber;

var BR_KEY_CURRENT;
var BR_KEY_BRESULT;
var BR_KEY_RRESULT;
var BR_KEY_FILES;
var BR_KEY_BLOADING;
var BR_KEY_RLOADING;
var BR_KEY_SELECTED;

var keyRestoreConfirmed;

var setRestoreConfirmFlag = function () {
  Session.set(keyRestoreConfirmed, true);
};

var clearRestoreConfirmedFlag = function () {
  Session.set(keyRestoreConfirmed, false);
};

var doRestore = function(event) {
    event.preventDefault();
    var startDescription = "Starting Restore";
    var failedDescription = "Restore failed";
    var succeededDescription = "Restore succeeded";
    var obj = {
      'time': time(),
      'description': startDescription
    };
    var records = Session.get(BR_KEY_RRESULT);
    records.push(obj);
    Session.set(BR_KEY_RRESULT, records);
    var fileId = Session.get(BR_KEY_SELECTED);
    var box = $('#restore-status');
    Session.set(BR_KEY_RLOADING, true);

    renderFilesTemplate();
    Meteor.call('restore', Utils.getOrgId(), serialNumber, fileId, function(error, result) {
      if (error){
        obj = {
          'time': time(),
          'description': failedDescription + ". " + error.reason
        };
      }
      else{
        obj = {
          'time': time(),
          'description': succeededDescription
        };
      }
      records = Session.get(BR_KEY_RRESULT);
      records.push(obj);
      Session.set(BR_KEY_RRESULT, records);
      Session.set(BR_KEY_RLOADING, false);
      renderFilesTemplate();
      clearRestoreConfirmedFlag();
    });
};

var addSerial2KeySpace = function() {
  serialNumber = Utils.getSerialNumber();
  BR_KEY_CURRENT = BR_KEY_CURRENT_PRE + "." + serialNumber;
  BR_KEY_BRESULT = BR_KEY_BRESULT_PRE + "." + serialNumber;
  BR_KEY_RRESULT = BR_KEY_RRESULT_PRE + "." + serialNumber;
  BR_KEY_FILES = BR_KEY_FILES_PRE + "." + serialNumber;
  BR_KEY_BLOADING = BR_KEY_BLOADING_PRE + "." + serialNumber;
  BR_KEY_RLOADING = BR_KEY_RLOADING_PRE + "." + serialNumber;
  BR_KEY_SELECTED = BR_KEY_SELECTED_PRE + "." + serialNumber;  
};

var initSession = function() {
  if (!Session.get(BR_KEY_CURRENT)) {
    Session.set(BR_KEY_CURRENT, PAGE_BACKUP);
  }
  if (!Session.get(BR_KEY_BRESULT)) {
    Session.set(BR_KEY_BRESULT, []);
  }
  if (!Session.get(BR_KEY_RRESULT)) {
    Session.set(BR_KEY_RRESULT, []);
  }
  Session.set(BR_KEY_FILES);
  Meteor.call('getFiles', Utils.getOrgId(), serialNumber, function(error, result) {
    Session.set(BR_KEY_FILES, result);
  });
};

BackupRestoreController = /*gigCenter*/RouteController.extend({
  template: 'br',
  /*
  breadCrumbsToReflectNavTreeSelection: function () {
    return [
      sxa.breadCrumbs.getBreadCrumbFor('System Tools', null, sxa.systemUtil.appType.CC),
      sxa.breadCrumbs.getBreadCrumbFor('Backup & Restore', Router.current().url, sxa.systemUtil.appType.CC)
    ]
  },*/
});

var time = function() {
  return '[' + moment().format(Utils.timeFormat) + ']';
};

var isActive = function(name) {
    if(Session.get(BR_KEY_CURRENT) === name) {
       return 'active';
    }
    return '';
};

Template.br.created = function() {
  addSerial2KeySpace();
  initSession();
};

Template.br.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.br.helpers({

  currentPage: function(name) {
     return Session.get(BR_KEY_CURRENT) === name;
  },

  isActive: isActive
});

var renderBackupTemplate = function() {
    Session.set(BR_KEY_CURRENT,PAGE_BACKUP);
    $('.tab-content').empty();
    var t = UI.render(Template.backup);
    UI.insert(t, $('.tab-content')[0]);
};

var renderRestoreTemplate = function() {
    Session.set(BR_KEY_CURRENT,PAGE_RESTORE);
    Session.set(BR_KEY_FILES);
    $('.tab-content').empty();
    var t = UI.render(Template.restore);
    UI.insert(t, $('.tab-content')[0]);
    Meteor.call('getFiles', Utils.getOrgId(), serialNumber, function(error, result) {
      Session.set(BR_KEY_FILES, result);
    }); 
};

Template.br.events({
  'click a[href="#restore"]': function(event) {
    renderRestoreTemplate();
  },
  'click a[href="#backup"]': function(event) {
    renderBackupTemplate();
  }
});


Template.backup.helpers({
  backupLoading: function() {
    return Session.get(BR_KEY_BLOADING);
  },
  isActive: isActive,
  backupResults: function(){
    return Session.get(BR_KEY_BRESULT);
  }
});

Template.backup.events({
  'click button[type="backup"]': function(event) {
    event.preventDefault();
    var startDescription = "Starting Backup";
    var failedDescription = "Backup failed";
    var succeededDescription = "Backup succeeded";
    var obj = {
      'time': time(),
      'description': startDescription
    };
    var records = Session.get(BR_KEY_BRESULT);
    records.push(obj);
    Session.set(BR_KEY_BRESULT, records);
    Session.set(BR_KEY_BLOADING, true);
	  var desc = $("#inputDescription").val();
    Meteor.call('backup', Utils.getOrgId(), serialNumber, desc, Utils.getUsername(), function(error, result) {
      if (error){
        obj = {
          'time': time(),
          'description': failedDescription + ". " + error.reason
        };
      }  
      else{
        obj = {
          'time': time(),
          'description': succeededDescription
        };
      }
      records = Session.get(BR_KEY_BRESULT);
      records.push(obj);
      Session.set(BR_KEY_BRESULT, records);
      Session.set(BR_KEY_BLOADING, false);
    });
  }
});

var renderFilesTemplate = function() {
  Meteor.call('getFiles', Utils.getOrgId(), serialNumber, function(error, result) {
    Session.set(BR_KEY_FILES, result);
    $('#configFilesContainer').empty();
    var t = UI.render(Template.configFiles);
    UI.insert(t, $('#configFilesContainer')[0]);
    $('#configFiles').dataTable({
      "ordering": false,
      "lengthMenu": [
        [5, 10, 20, -1],
        [5, 10, 20, "All"]
      ]
    });
    $('#configFilesContainer').removeClass('hidden');
    $('#configFiles_length').remove();
    $('#configFiles_filter').remove();
  });
};

Template.restore.created = function () {
  keyRestoreConfirmed = Utils.getKeyNs() + 'restore.confirm-flag';
  clearRestoreConfirmedFlag();
}

Template.restore.rendered = function(){
  renderFilesTemplate(); 
};

Template.restore.destroyed = function() {
  //clear all keys
  clearRestoreConfirmedFlag();
  //not do Session destroy so that we can navigate back to this page with the prevous cached state
  //Session.set(BR_KEY_RLOADING);
  //Session.set(BR_KEY_RRESULT);
  //Session.set(BR_KEY_SELECTED);
};

Template.restore.helpers({
  
  restoreLoading: function() {
    return Session.get(BR_KEY_RLOADING);
  },
  
  isActive: isActive,
  restoreResults: function(){
    return Session.get(BR_KEY_RRESULT);
  },

  restoreConfirm: function() {
    return Session.get(keyRestoreConfirmed);
  },
  
  restoreRunning: function() {
    return Session.get(BR_KEY_RLOADING) || !Session.get(BR_KEY_SELECTED);
  }
});



Template.restore.events({

  'click input[type="radio"]': function(event) {
    Session.set(BR_KEY_SELECTED, event.currentTarget.id);
  },

  'click #btn-restore': function(event) {
    setRestoreConfirmFlag();
  },

  'click #btn-cancel': function(event) {
    clearRestoreConfirmedFlag();
  },

  'click #btn-confirm': function(event) {
    doRestore(event);
  }

});

Template.configFiles.helpers({
  files: function() {
    return Session.get(BR_KEY_FILES);
  },
  getTime: function() {
    var t = this['uploadTime'];
    return moment(t).format(Utils.timeFormat);
  },
  isSelected: function(id) {
    return Session.get(BR_KEY_SELECTED) === id;
  }
});

Template.configFiles.events({
  'click input[type="radio"]': function(event) {
    Session.set(BR_KEY_SELECTED, event.currentTarget.id);
  }
});



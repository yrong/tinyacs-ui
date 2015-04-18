var BR_KEY_BRESULT_PRE = "devicelog.backupResults";
var BR_KEY_BLOADING_PRE = "devicelog.backupLoading";
var serialNumber,BR_KEY_BRESULT,BR_KEY_BLOADING;

var addSerial2KeySpace = function() {
  serialNumber = Utils.getSerialNumber();
  BR_KEY_BRESULT = BR_KEY_BRESULT_PRE + "." + serialNumber;
  BR_KEY_BLOADING = BR_KEY_BLOADING_PRE + "." + serialNumber;
};

var initSession = function() {
  if (!Session.get(BR_KEY_BRESULT)) {
    Session.set(BR_KEY_BRESULT, []);
  }
};

var time = function() {
  return '[' + moment().format(Utils.timeFormat) + ']';
};

Template.DeviceLog.created = function() {
  addSerial2KeySpace();
  initSession();
};

Template.DeviceLog.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.DeviceLog.helpers({
  backupLoading: function() {
    return Session.get(BR_KEY_BLOADING);
  },
  backupResults: function(){
    return Session.get(BR_KEY_BRESULT);
  }
});



Template.DeviceLog.events({
  'click button.upload': function(event) {
    event.preventDefault();
    var startDescription = i18n('deviceLogWaiting');
    var failedDescription = i18n('deviceLogFailed');
    var succeededDescription = i18n('deviceLogSuccess');
    var obj = {
      'time': time(),
      'description': startDescription
    };
    var records = Session.get(BR_KEY_BRESULT);
    records.push(obj);
    Session.set(BR_KEY_BRESULT, records);
    Session.set(BR_KEY_BLOADING, true);
    var downloadUrl,urlParts,authenticatedUrl;
    Meteor.call('getDeviceLog', Utils.getOrgId(), serialNumber, function(error, result) {
      if (error) {
        obj = {
          'time': time(),
          'description': failedDescription + ". " + error.reason
        };
      } else {
        downloadUrl = result.downloadUrl;
        urlParts = downloadUrl.split("//") || downloadUrl.split("\\");
        authenticatedUrl = urlParts[0]+ "//" + result.username + ":" + result.password + "@" + urlParts[1];
        obj = {
          'time': time(),
          'description': succeededDescription,
          'downloadUrl' : authenticatedUrl
        };
      }
      records = Session.get(BR_KEY_BRESULT);
      records.push(obj);
      Session.set(BR_KEY_BRESULT, records);
      Session.set(BR_KEY_BLOADING, false);
    });
  },
  'click a.download': function(event) {
    
  }
});



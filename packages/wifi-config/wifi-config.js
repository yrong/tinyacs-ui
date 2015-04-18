var orgId, cpeId, tabId;
var parameterNames = Radio.parameterNames;
var path = Radio.path;


var getRadioTwo = function() {
  Meteor.call('getRadio', orgId, cpeId, parameterNames['2'], function(error, result) {
    Radio.getErrorResult(error, result, '2', path['2']);
  });
};

var getRadioFive = function() {
  Meteor.call('getRadio', orgId, cpeId, parameterNames['5'], function(error, result) {
    Radio.getErrorResult(error, result, '5', path['5']);
  });
};

var getSsid = function() {
  Meteor.call('getSsid', orgId, cpeId, function(error, result) {
    if (error) {
      Session.set('ssidError', error.reason);
    } else {
      Session.set('ssid', result);
    }
    Session.set('ssid-ready', true);
  });
};

var cleanupSession = function() {
  Session.set('radio2-summary-ready', false);
  Session.set('radio5-summary-ready', false);
  Session.set('radio2Error');
  Session.set('radio5Error');
  Session.set('ssid-ready', false);
  Session.set('ssidError');
  Session.set('selected');
};



WifiConfigController = RouteController.extend({
  template: 'wificonfig',
  /*breadCrumbsToReflectNavTreeSelection: function() {
    return [
      sxa.breadCrumbs.getBreadCrumbFor('Configuration', null, sxa.systemUtil.appType.CC),
      sxa.breadCrumbs.getBreadCrumbFor('Wireless', Router.current().url, sxa.systemUtil.appType.CC)
    ]
  },
  onRun: function() {
    tabId = this.params.hash || 'radio2';
    this.next();
  }*/
});

Template.wificonfig.rendered = function() {
  SmartAdmin.pageSetup();
  switch (tabId) {
    case 'radio2':
      $('#liRadio2').addClass('active');
      $('#radio2').addClass('active');
      $('#liRadio2').click();
      break;
    case 'radio5':
      $('#liRadio5').addClass('active');
      $('#radio5').addClass('active');
      $('#liRadio5').click();
      break;
    case 'ssidManager':
      $('#liSsidManager').addClass('active');
      $('#ssidManager').addClass('active');
      $('#liSsidManager').click();
      break;
  }
};

Template.wificonfig.created = function() {
  orgId = Utils.getOrgId();
  cpeId = Utils.getCpeId();
  cleanupSession();
};

Template.wificonfig.destroyed = function() {
  cleanupSession();
};

Template.wificonfig.events({
  'click #liRadio2': function(event) {
    if (!Session.get('radio2-summary-ready')) {
      Session.set('radio2-summary-ready', false);
      getRadioTwo();
    }
  },
  'click #liRadio5': function(event) {
    if (!Session.get('radio5-summary-ready')) {
      Session.set('radio5-summary-ready', false);
      getRadioFive();
    }
  },
  'click #liSsidManager': function(event) {
    if (!Session.get('ssid-ready')) {
      getSsid();
    }
  }
});

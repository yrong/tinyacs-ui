var orgId, cpeId;
var parameterNames = Radio.parameterNames;
var path = Radio.path;

TroubleshootingWifiController = gigCenterRouteController.extend({
  template: 'troubleshootingWifi',
  breadCrumbsToReflectNavTreeSelection: function() {
    return [
      sxa.breadCrumbs.getBreadCrumbFor('Troubleshooting', null, sxa.systemUtil.appType.CC),
      sxa.breadCrumbs.getBreadCrumbFor('Wireless', Router.current().url, sxa.systemUtil.appType.CC)
    ]
  }
});

Template.troubleshootingWifi.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.troubleshootingWifi.created = function() {
  orgId = Utils.getOrgId();
  cpeId = Utils.getCpeId();

  Meteor.call('getRadio', orgId, cpeId, parameterNames['2'], function(error, result) {
      Radio.getErrorResult(error, result, '2', path['2']);
    });

  Session.set('radio2-summary-ready', false);
  Session.set('radio5-summary-ready', false);
  Session.set('radio2Error');
  Session.set('radio5Error');
  Session.set('ssid-ready', false);
  Session.set('ssidError');
};

Template.troubleshootingWifi.destroyed = function() {
  Session.set('radio2-summary-ready', false);
  Session.set('radio5-summary-ready', false);
  Session.set('radio2Error');
  Session.set('radio5Error');
  Session.set('ssid-ready', false);
  Session.set('ssidError');
};

Template.troubleshootingWifi.events({
  'click #liRadio5': function(event) {
    if (!Session.get('radio5-summary-ready')) {
      Session.set('radio5-summary-ready', false);
      Meteor.call('getRadio', orgId, cpeId, parameterNames['5'], function(error, result) {
        Radio.getErrorResult(error, result, '5', path['5']);
      });
    }
  },
  'click #liSsidManager': function(event) {
    if (!Session.get('ssid-ready')) {
      Meteor.call('getSsid', orgId, cpeId, function(error, result) {
        if (error) {
          Session.set('ssidError', error.reason);
        } else {
          Session.set('ssid', result);
        }
        Session.set('ssid-ready', true);
      });
    }
  }
});

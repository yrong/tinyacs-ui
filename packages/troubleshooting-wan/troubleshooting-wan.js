
// ROUTE CONTROLLER

TroubleshootingWanController = RouteController.extend({
  template: 'troubleshootingWan'
  /*refreshFlag: keyWanSummaryRefreshFlag,
  breadCrumbsToReflectNavTreeSelection: function() {
    return [
      sxa.breadCrumbs.getBreadCrumbFor('Troubleshooting', null, sxa.systemUtil.appType.CC),
      sxa.breadCrumbs.getBreadCrumbFor('WAN', Router.current().url, sxa.systemUtil.appType.CC)
    ]
  }*/
});

// TEMPLATE
var orgId;

var cleanupData = function() {
  Session.set(keyWanInterfaces);
  Session.set(keyWanInterfacesSelected);
  Session.set(keyWanInterfacesError);
  Session.set(keyWanSummary);
  Session.set(keyWanSummaryError);
};

var cleanup = function() {
  cleanupData();
  Session.set(keyWanInSummary);
};

Template.troubleshootingWan.created = function() {
  orgId = Utils.getOrgId();

  Session.set(keyWanInSummary, true);
  Session.set(keyWanSummaryRefreshFlag, true);
  this.autorun(function() {
    if (Session.equals(keyWanSummaryRefreshFlag, true)) {
      cleanupData();

      var serialNumber = Utils.getSerialNumber();
      Meteor.call('getWanInterfaces', orgId, serialNumber, function(error, data) {
        var currentSerialNumber = Utils.getSerialNumber();
        if (serialNumber !== currentSerialNumber) {
          // it's a too late return
          return;
        }

        if (error) {
          Session.set(keyWanSummaryRefreshFlag, false);
          Session.set(keyWanInterfacesError, error.reason);
          return;
        }

        Session.set(keyWanInterfaces, _.map(data, function(v, i) {
          v._Index = i;
          return v;
        }));
        Session.set(keyWanInterfacesSelected, 0);

        Meteor.call('getWanSummaries', orgId, serialNumber, data, function(error, data) {
          var currentSerialNumber = Utils.getSerialNumber();
          if (serialNumber !== currentSerialNumber) {
            // it's a too late return
            return;
          }
          Session.set(keyWanSummaryRefreshFlag, false);

          if (error) {
            Session.set(keyWanSummaryError, error.reason);
            return;
          }
          Session.set(keyWanSummary, data);
        });
      });
    }
  });
};

Template.troubleshootingWan.rendered = function() {
  SmartAdmin.pageSetup();

  $.validator.addMethod("IPAddress", function(value, element) {
    var digitdotformat = /^[\.\d]+$/;
    var ipformat =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return this.optional(element) || !(digitdotformat.test(value)) || ipformat.test(value);
  }, "The IP Address is invalid");
};

Template.troubleshootingWan.destroyed = function() {
  cleanup();
};

var wanHelpers = {
  refreshing: function() {
    return Session.get(keyWanSummaryRefreshFlag);
  },

  interfacesReady: function() {
    return Session.get(keyWanInterfaces) != null || Session.get(keyWanInterfacesError) != null;
  }
};

Template.troubleshootingWan.helpers(_.extend(wanHelpers, {
  interfacesError: function() {
    return Session.get(keyWanInterfacesError);
  },

  interfaces: function() {
    return Session.get(keyWanInterfaces);
  },

  interfaceSelected: function() {
    var self = Template.instance();
    Meteor.defer(function() {
      self.$('#wan-interfaces').change();
    });
  }
}));

Template.troubleshootingWan.events({
  'change #wan-interfaces': function(event) {
    var interfaceIndex = $(event.currentTarget).val();
    Session.set(keyWanInterfacesSelected, interfaceIndex);
  },

  'show.bs.tab #wanTabs a[href="#summary"]': function(event) {
    Session.set(keyWanInSummary, true);
  },

  'show.bs.tab #wanTabs a[href="#ping"], show.bs.tab #wanTabs a[href="#traceroute"]': function(event) {
    Session.set(keyWanInSummary, false);
  }
});

// --------------------- Template.wansummary -------------------------

Template.wansummary.helpers(_.extend(wanHelpers, {
  summaryReady: function() {
    return Session.get(keyWanSummary) != null || Session.get(keyWanSummaryError) != null;
  },

  summaryError: function() {
    return Session.get(keyWanSummaryError);
  },

  summaryData: function() {
    var index = Session.get(keyWanInterfacesSelected);
    var summaryArray = Session.get(keyWanSummary);
    if (summaryArray[index] == null) {
      index = 0;
    }

    return summaryArray[index];
  },

  wanEnabled: function() {
    var value = this['Enable'];
    if (value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return 'Unknown';
  },

  wanUptime: function() {
    var value = this['Uptime'],
      dur, d, h, m, s, uptime = '';

    if (value != null) {
      dur = moment.duration(parseInt(value), 's');
      //mon = dur.months();
      //if (mon > 0) uptime += mon + ' month(s) ';
      d = parseInt(dur.asDays());
      if (d > 0) uptime += d + 'd ';
      h = dur.hours();
      if (h > 0) uptime += h + 'h ';
      m = dur.minutes();
      if (m > 0) uptime += m + 'm ';
      s = dur.seconds();
      if (s > 0 || (s === 0 && !uptime)) uptime += s + 's ';

      return uptime;
    }

    return 'Unknown';
  },

  wanDownstreamRate: function() {
    var dsShapingRate = this['X_000631_DsShapingRate'];
    if (dsShapingRate == 0) {
      return i18n('notLimited');
    }
    return this['_DownstreamRate'];
  },

  wanParameter: function(key) {
    var value = Utils.getValueByPath(this, key);
    return value != null ? value : 'Unknown';
  },

  hasParameter: function(key) {
    var value = Utils.getValueByPath(this, key);
    return value != null;
  },

  hasVlanParam: function() {
    return _.isBoolean(this['_VlanTagAction']);
  }
}));

var keySummaryHandleError = 'summaryHandleError';
var wanConnection = new Meteor.Collection('wan-connection');

var findOneValue = function(keyPath) {
  var doc, f = {};
  f[keyPath] = 1;

  doc = wanConnection.findOne({}, {
    fields: f
  });
  return doc && Utils.getValueByPath(doc, keyPath);
};

Template.wansummary.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.wansummary.helpers({
  summaryReady: function() {
    var handleError = Session.get(keySummaryHandleError)
    return handleError != null || wanConnection.find().count() >= 1;
  },

  hasSummaryError: function() {
    var handleError = Session.get(keySummaryHandleError)
    return handleError != null || findOneValue('error') != null;
  },

  getSummaryError: function() {
    var handleError = Session.get(keySummaryHandleError)
    return handleError || findOneValue('error');
  },

  wanEnabled: function() {
    var value = findOneValue('Enable');
    if (value) {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return 'Unknown';
  },

  wanUptime: function() {
    var value = findOneValue('Uptime'),
      dur, d, h, m, s, uptime = '';

    if (value != null) {
      dur = moment.duration(parseInt(value), 's');
      //mon = dur.months();
      //if (mon > 0) uptime += mon + ' month(s) ';
      d = parseInt(dur.asDays());
      if (d > 0) uptime += d + ' day(s) ';
      h = dur.hours();
      if (h > 0) uptime += h + ' hour(s) ';
      m = dur.minutes();
      if (m > 0) uptime += m + ' minute(s) ';
      s = dur.seconds();
      if (s > 0 || (s === 0 && !uptime)) uptime += s + ' second(s) ';

      return uptime;
    }

    return 'Unknown';
  },

  wanParameter: function(key) {
    var value = findOneValue(key);
    return value != null ? value : 'Unknown';
  },

  hasParameter: function(key) {
    var value = findOneValue(key);
    return value != null;
  }

});

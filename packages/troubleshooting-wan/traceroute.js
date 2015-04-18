var keyTraceState;
var keyTraceHost;
var keyTraceResult;

var stateRunning = 'Running';
var stateCompleted = 'Completed';

var init = function() {
  keyTraceState = Utils.getKeyNs() + 'traceroute.state';
  keyTraceHost = Utils.getKeyNs() + 'traceroute.host';
  keyTraceResult = Utils.getKeyNs() + 'traceroute.result';
};

Template.traceroute.created = function() {
  init();
};

var setStatus = function() {
  var state = Session.get(keyTraceState);
  var host = Session.get(keyTraceHost);
  var button = $('#btn-traceroute');

  if (state == stateRunning || host == null || host === "") {
    button.prop('disabled', true);
  } else { //stateCompleted
    button.prop('disabled', false);
  }

  var inputHost = $('#input-traceHost');
  if (state == stateRunning) {
    inputHost.prop('disabled', true);
  } else {
    inputHost.prop('disabled', false);
  }
};

Template.traceroute.rendered = function() {
  var inputHost = this.$('#input-traceHost');
  var host = Session.get(keyTraceHost);
  inputHost.val(host);
  setStatus();

  $("#form-traceroute").validate({
    onkeyup: function(element, event) {
      var jqElement = $(element);
      if (jqElement.attr('id') !== 'input-traceHost')
        return;

      if (this.element(element)) {
        var host = jqElement.prop('value').trim();
        Session.set(keyTraceHost, host);
        return;
      }
      $('#btn-traceroute').prop('disabled', true);
    },

    rules: {
      tracerouteHost: {
        IPAddress: true
      }
    },

    highlight: function(element) {
      $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
    },

    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
    },

    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function(error, element) {
      $('#traceroute_error_place').append(error);
    }
  });
};

Template.traceroute.helpers({
  hops: function() {
    var traces = Session.get(keyTraceResult);
    if (traces == null || traces._error) {
      Logger.warn(keyTraceResult + ' is empty or has errors');
      return;
    }

    var routeHops = traces['RouteHops'];
    var keys = _.keys(routeHops);
    var obj, result = [],
      index = 0;

    for (var i = 0; i < keys.length; i++) {
      obj = routeHops[keys[i]];
      if (obj['HopHost'] === '*')
        continue;

      obj['index'] = ++index;
      obj['time1'] = obj['HopRTTimes'];

      /*obj['HopHost'] = obj['HopHost'].split(',')[0];
      obj['HopHostAddress'] = obj['HopHostAddress'].split(',')[0];*/
      result.push(obj);
    }

    return result;
  },

  loading: function() {
    return Session.equals(keyTraceState, stateRunning);
  },

  ready: function() {
    return Session.equals(keyTraceState, stateCompleted);
  },

  error: function() {
    var traces = Session.get(keyTraceResult);
    return traces && traces._error;
  },

  componentStatus: function() {
    setStatus();
  }
});

Template.traceroute.events({
  'click #btn-traceroute': function(event) {
    event.preventDefault();

    var orgId = Utils.getOrgId(),
      serialNumber = Utils.getSerialNumber(),
      wanIndex = Session.get(keyWanInterfacesSelected),
      wanInterfaces = Session.get(keyWanInterfaces),
      traceParam = {
        "Interface": wanInterfaces[wanIndex]._WanIf,
        "Host": Session.get(keyTraceHost),
        "NumberOfTries": 1,
        "MaxHopCount": 30,
        "Timeout": 1000
      };

    Session.set(keyTraceResult);
    Session.set(keyTraceState, 'Running');
    Meteor.call('traceroute', orgId, serialNumber, traceParam, function(error, result) {
      var traceResult;
      if (error) {
        traceResult = {
          _error: error.reason
        };
      } else {
        if (result.DiagnosticsState !== "Complete") {
          traceResult = {
            _error: result.DiagnosticsState
          };
        } else {
          traceResult = result;
        }
      }

      Session.set(keyTraceResult, traceResult);
      Session.set(keyTraceState, stateCompleted);
    });
  }
});

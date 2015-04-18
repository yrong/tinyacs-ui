var keyPingState;
var keyPingAddress;
var keyPingResult;

var stateRunning = 'Running';
var stateCompleted = 'Completed';

var init = function() {
  keyPingState = Utils.getKeyNs() + 'ipping.state';
  keyPingAddress = Utils.getKeyNs() + 'ipping.address';
  keyPingResult = Utils.getKeyNs() + 'ipping.result';
};


var setStatus = function() {
  var state = Session.get(keyPingState);
  var address = Session.get(keyPingAddress);
  var button = $('#btn-ipping');

  if (state == stateRunning || address == null || address === "") {
    button.prop('disabled', true);
  } else { //stateCompleted
    button.prop('disabled', false);
  }

  var inputAddress = $('#input-pingAddress');
  if (state == stateRunning) {
    inputAddress.prop('disabled', true);
  } else {
    inputAddress.prop('disabled', false);
  }
};

Template.ipping.created = function() {
  init();
};

Template.ipping.rendered = function() {
  var inputAddress = this.$('#input-pingAddress'),
    addr = Session.get(keyPingAddress);
  inputAddress.val(addr);
  setStatus();

  $("#form-ipping").validate({
    onkeyup: function(element, event) {
      var jqElement = $(element);
      if (jqElement.attr('id') !== 'input-pingAddress')
        return;

      if (this.element(element)) {
        var address = jqElement.prop('value').trim();
        Session.set(keyPingAddress, address);
        return;
      }
      $('#btn-ipping').prop('disabled', true);
    },

    rules: {
      ipaddress: {
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
      $('#ipping_error_place').append(error);
    }
  });
};

Template.ipping.helpers({
  getPingResult: function() {
    return Session.get(keyPingResult);
  },

  loading: function() {
    return Session.equals(keyPingState, stateRunning);
  },

  error: function() {
    var pingResult = Session.get(keyPingResult);
    return pingResult && pingResult._error;
  },

  ready: function() {
    return Session.equals(keyPingState, stateCompleted);
  },


  componentStatus: function() {
    setStatus();
  }
});

Template.ipping.events({
  'click #btn-ipping': function(event) {
    var orgId = Utils.getOrgId(),
      serialNumber = Utils.getSerialNumber(),
      inputAddress = $('#input-pingAddress'),
      btnPing = $('#btn-ipping'),
      addr = inputAddress.val().trim(),
      pingParam = {
        "Interface": Utils.getWanPathAlias(),
        "Host": addr,
        "NumberOfRepetitions": 5,
        "DataBlockSize": 500,
        "Timeout": 3000
      };

    event.preventDefault();
    var orgId = Utils.getOrgId(),
      serialNumber = Utils.getSerialNumber(),
      wanIndex = Session.get(keyWanInterfacesSelected),
      wanInterfaces = Session.get(keyWanInterfaces),
      pingParam = {
        "Interface": wanInterfaces[wanIndex]._WanIf,
        "Host": Session.get(keyPingAddress),
        "NumberOfRepetitions": 5,
        "DataBlockSize": 500,
        "Timeout": 3000
      };

    Session.set(keyPingResult);
    Session.set(keyPingState, stateRunning);
    Meteor.call('ipping', orgId, serialNumber, pingParam, function(error, result) {
      var pingResult;
      if (error) {
        pingResult = {
          _error: error.reason
        };
      } else {
        if (result.DiagnosticsState !== "Complete") {
          pingResult = {
            _error: result.DiagnosticsState
          };
        } else {
          pingResult = result;
          pingResult._CompleteTime = moment().format(Utils.timeFormat);
        }
      }

      Session.set(keyPingResult, pingResult);
      Session.set(keyPingState, stateCompleted);
    });
  }
});

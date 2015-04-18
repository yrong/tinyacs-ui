
var orgId;

var dialplanError = 'dialplan.error';

var dialplanResult = 'dialplan.result';

dialplanSelected = 'dialplan.selected';

var dialplanController = RouteController.extend({
    template: 'dialplan'
});

var removeItemById = function(arr, id) {
    return _.reject(arr, function(item) {
        return item._id === id;
    });
};

Router.map(function() {
  this.route('dial-plan', {
    path: '/dial-plan',
    controller: dialplanController
  });
});

Template.dialplan.created = function() {
  orgId = Utils.getOrgId();

  Meteor.call('getDialPlan', orgId, function(error, result) {
    if (error) {
      Session.set(dialplanError, error['reason']);
    } else {
      Session.set(dialplanResult, result);
    }
  });
};

Template.dialplan.rendered = function() {
  SmartAdmin.pageSetup();
};


Template.dialplan.destroyed = function() {
  Session.set(dialplanResult);
  Session.set(dialplanError);
};

var dialplans = function() {   
    return Session.get(dialplanResult);
};

Template.dialplan.helpers({
  ready: function () {
    return !Session.get(dialplanResult) || !Session.get(dialplanError);
  },

  error: function() {
    return Session.get(dialplanError);
  },

  dialplans: dialplans,

  rules: function() {
    return this.rules.join('|');
  }

});

Template.dialplan.events({

  'click button[type="submit"]': function(event) {
        event.preventDefault();
        Session.set(dialplanSelected, null);
        Router.go('dial-plan-detail-new');
  },

  'click .dialplan': function(event) {
    var $target = $(event.target);
    Session.set(dialplanSelected, this);
    if ($target.is('.fa-trash-o')) {
      var confirmDialog = document.getElementById("confirmDialog");
      $(confirmDialog).css('display', 'block');
    } else {
      Router.go('/dial-plan-detail/' + this._id);
    }
  },

  'click .confirm': function(event) {
    var parent = $(event.currentTarget).parent();
    parent.css('display', 'none');
    var id = Session.get(dialplanSelected)._id;
    Meteor.call('dialPlanDelete', orgId, id, function(error, result) {
      if (!error) {
        Session.set(dialplanResult, removeItemById(Session.get(dialplanResult), id));
        Router.go('dial-plan');
      } else {
        Session.set(dialplanError, error.reason);
      }
    });
  },


  'click .cancel': function(event) {
    $(event.currentTarget).parent().css('display', 'none');
  }
});

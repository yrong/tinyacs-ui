var orgId;

var removeItemById = function(arr, id) {
	return _.reject(arr, function(item) {
		return item._id === id;
	});
};

DeviceTypes = new Meteor.Collection(null);


var GroupController = RouteController.extend({
    template: 'group',

	/*
	onRun: function() {
		var self = this;

		orgId = Utils.getOrgId() ||'50';
		Meteor.call('groupGet', orgId, function(error, result) {
			Session.set("groups", result);
			Meteor.call('deviceTypeGet', orgId, function(error, result) {
				_.each(result, function(type) {
					DeviceTypes.upsert(type._id, type);
				})
				self.render();
			});
		});
		this.next();
	}*/
});

Template.group.created = function(){
	orgId = Utils.getOrgId() ||'50';
	Meteor.call('groupGet', orgId, function(error, result) {
		Session.set("groups", result);
		Meteor.call('deviceTypeGet', orgId, function(error, result) {
			_.each(result, function(type) {
				DeviceTypes.upsert(type._id, type);
			})
		});
	});
};

Template.group.destroyed = function() {
	Session.set("groups");
	Session.set("group.error");
};

Router.map(function() {
	this.route('device-group', {
		path: '/device-group',
		controller: GroupController,
	});
});

Template.group.helpers({
	groups: function() {
		return Session.get("groups");
	},
	selected: function() {
		return Session.get('selected');
	},
	error: function() {
		return Session.get('group.error');
	}
});

Template.group.events({

    'click .group': function(event) { 
        var $target = $(event.target);
        Session.set('selected', this);
		if ($target.is('.fa-trash-o')) {
			var confirmDialog = document.getElementById("confirmDialog");
			$(confirmDialog).css('display', 'block');	
		} else {
			Router.go('/groupdetail/' + this._id);
		}
    },

   'click button[type="submit"]': function(event) {
        event.preventDefault();
        Session.set('selected', null);
        Router.go('groupnew');
    },

    'click .confirm': function(event) {
	    var parent = $(event.currentTarget).parent();
	    parent.css('display', 'none');
	    var id = Session.get('selected')._id;
		Meteor.call('groupDelete', orgId, id, function(error, result) {
			if (!error) {
				Session.set('groups', removeItemById(Session.get("groups"), id));
				Router.go('device-group');
			} else {
				Session.set('group.error', error.reason);
			}
		});
	},


	'click .cancel': function(event) {
		$(event.currentTarget).parent().css('display', 'none');
	}
  
});

Template.group.rendered = function() {
	SmartAdmin.pageSetup();
}

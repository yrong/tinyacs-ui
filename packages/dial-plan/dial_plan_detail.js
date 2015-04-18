var dialplandetail_error = "dialplan.detail.error";

var dialplanDetailController = RouteController.extend({
    template: 'dialplandetail',

    data: function() {
        return Session.get(dialplanSelected);
    }
});

Router.map(function() {
    
    this.route('dial-plan-detail', {
        path: '/dial-plan-detail/:planid',
        controller: dialplanDetailController,     
    });

    this.route('dial-plan-detail-new', {
        path: '/dial-plan-new',
        controller: dialplanDetailController,
    });
});

var orgId;

var validate = function() {
    var validator = $('.form-horizontal').bootstrapValidator({
            message: 'This value is not valid',
            fields: {
                inputName: {
                    message: 'Name is not valid',
                    validators: {
                        notEmpty: {
                            message: 'Name is required and cannot be empty'
                        },
                        stringLength: {
                            min: 4,
                            message: 'Name must be more than 4 and less than 20 characters long'
                        },
                        regexp: {
                            regexp: /^[a-zA-Z0-9_\s-]+$/,
                            message: 'Name can only consist of alphabetical, number, underscore, whitespace'
                        }    
                    }
                },
                shortTime: {
                    validators: {
                        notEmpty: {
                            message: 'Short Timer is required and cannot be empty'
                        },
                        integer: {
                            message: 'Short Timer is not an integer'
                        },
                        callback: {
                            callback: function(value, validator, $field) {
                                
                                validator.resetField('longTime','');

                                if(value<1 || value>16){
                                    return {
                                        valid: false,
                                        message: 'shortTime value between:1 and 16'
                                    };
                                }
                                
                                return true;
                            }
                        }       
                    }
                },
                longTime: {
                    validators: {
                        notEmpty: {
                            message: 'Long Timer is required and cannot be empty'
                        },
                        integer: {
                            message: 'Long Timer is not an integer'
                        },
                        callback: {
                            callback: function(value, validator, $field) {
                                
                                if(value<4 || value>20){
                                    return {
                                        valid: false,
                                        message: 'LongTime value between:4 and 20'
                                    };
                                }
                                if(parseInt($("#shortTime").val())>=parseInt(value)){
                                    return {
                                        valid: false,
                                        message: 'LongTime should be greater than ShortTime'
                                    };
                                }
                                return true;
                            }
                        }       
                    }
                },
                rules: {
                    validators: {
                        notEmpty: {
                            message: 'Rules is required and cannot be empty'
                        }        
                    }
                }  
            }
        })
        .data('bootstrapValidator');
    validator.validate();

    return validator.isValid();
};

Template.dialplandetail.created = function() {
    orgId = Utils.getOrgId() || '50';
}


Template.dialplandetail.rendered = function() {
};

Template.dialplandetail.destroyed = function() {
  Session.set(dialplandetail_error);
  Session.set(dialplanSelected);
};



Template.dialplandetail.helpers({
	
	getError: function(){
		return Session.get(dialplandetail_error);
	},
    
    selected: function(){
        return this.selected === true;
    },

    disabled: function(){
        return Session.get(dialplanSelected);
    },

    rules: function() {
        return this.rules.join('|');
    }
});

Template.dialplandetail.events({

    'click button[type="submit"]': function(event) {
        event.preventDefault();
        var dialplan = Session.get(dialplanSelected) || {};
        if (validate()) {  
            dialplan.name = $("#inputName").val();
            dialplan.description = $("#inputDescription").val();
            dialplan.shortTimer = parseInt($("#shortTime").val());
            dialplan.longTimer = parseInt($("#longTime").val());
            dialplan.rules = $("#rules").val().split('|');
            Meteor.call('dialPlanAddUpate', orgId, dialplan, function(error, result) {
                if (!error) {
                    Router.go('dial-plan');
                } else {
                    Session.set(dialplandetail_error, error.reason);
                }
            });
        }             
    },

    'click button[type="reset"]': function(event) {
        event.preventDefault();
        Session.set(dialplandetail_error);
        Session.set(dialplanSelected, null);
        Router.go('dial-plan');
    }

});
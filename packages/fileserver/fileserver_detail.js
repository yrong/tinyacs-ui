var FileServerDetailController = RouteController.extend({
    template: 'fileserverdetail',

    data: function() {
        return Session.get(fileserverSelected);
    }
});

Router.map(function() {
    
    this.route('file-server-detail', {
        path: '/file-server-detail/:groupid',
        controller: FileServerDetailController,     
    });

    this.route('file-server-detail-new', {
        path: '/file-server-detail-new',
        controller: FileServerDetailController,
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
                            regexp: /^[a-zA-Z0-9_\s]+$/,
                            message: 'Name can only consist of alphabetical, number, underscore, whitespace'
                        }
                        /*callback: {
                            callback: function(value, validator, $field) {
                                var cpeMappings = cpeMappingsObj();
                                if (_.has(cpeMappings,value)) {
                                    return {
                                        valid: false,
                                        message: 'The appName is existed in CPE already'
                                    };
                                }
                                return true;
                            }
                        }*/ 
                    }
                },
                inputUrl: {
                    validators: {
                        notEmpty: {
                            message: 'File Url is required and cannot be empty'
                        },
                        uri: {
                            allowLocal: true,
                            message: 'File URL is not valid'
                        }
                    }
                } 
            }
        })
        .data('bootstrapValidator');
    validator.validate();

    return validator.isValid();
};

Template.fileserverdetail.created = function() {
    orgId = Utils.getOrgId() || '50';
}



Template.fileserverdetail.rendered = function() {

};

Template.fileserverdetail.destroyed = function() {
  //authNeeded.set(true);
  Session.set(fileserverdetail_error);
  Session.set(fileserverSelected);
};

var fileserverdetail_error = "fileserver.detail.error";

Template.fileserverdetail.helpers({
	
	getError: function(){
		return Session.get(fileserverdetail_error);
	},
    
    selected: function(){
        return this.selected === true;
    }

    /*authNeeded: function(){
        return authNeeded.get();
    }*/
});

//var authNeeded = new Blaze.ReactiveVar(true);

Template.fileserverdetail.events({

    'click button[type="submit"]': function(event) {
        event.preventDefault();
        var fileserver = {};
        if (validate()) {
            fileserver.baseUrl = $("#inputUrl").val();
            fileserver.username = $("#inputUserName").val();
            fileserver.password = $("#inputPassword").val();
            fileserver.name = $("#inputName").val();
            fileserver.description = $("#inputDescription").val();
            Meteor.call('fileServerAddUpate', orgId, fileserver, function(error, result) {
                if (!error) {
                    Router.go('file-server');
                } else {
                    Session.set(fileserverdetail_error, error.reason);
                }
            });
        }             
    },

    'click button[type="reset"]': function(event) {
        event.preventDefault();
        Session.set(fileserverdetail_error);
        Session.set(fileserverSelected, null);
        Router.go('file-server');
    }

    /*'change select[id="authMode"]': function(event) {

        var mode = event.currentTarget.value;

        if(mode === 'none'){
            authNeeded.set(false);
        }else{
            authNeeded.set(true);
        }
        
    }*/
});
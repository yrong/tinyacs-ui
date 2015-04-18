var WorkFlowController = RouteController.extend({
	template: 'WorkflowWizard'
});

Router.map(function() {
	this.route('workflowNew', {
		path: '/netop-workflows/new',
		controller: WorkFlowController
	});
});



Router.map(function() {
	this.route('workflowDetail', {
		path: '/netop-workflows/:workflowid',
		template: "workflowDetail"
	});
});

var validateBasic = function() {
	var validator = $('.workflow-basic').bootstrapValidator({
			message: 'This value is not valid',
			fields: {
				inputName: {
					message: 'Name is not valid',
					validators: {
						notEmpty: {
							message: 'Name is required and cannot be empty'
						},
						stringLength: {
							min: 3,
							max: 20,
							message: 'Name must be more than 3 and less than 20 characters long'
						},
						regexp: {
							regexp: /^[a-zA-Z0-9_\s]+$/,
							message: 'Name can only consist of alphabetical, number, underscore, whitespace'
						},
						callback: {
							callback: function(value, validator, $field) {

								return true;
							}
						}
					}
				}
			}
		})
		.data('bootstrapValidator');
	validator.validate();

	return validator.isValid();
};


var prepareData = function(orgId) {
	Meteor.call('groupGet', orgId, function(error, result) {
		Session.set("groups", result);
		Meteor.call('profilesGet', orgId, function(error, result) {
			Session.set("profiles", result);
			Meteor.call('getFiles', orgId, function(error, result) {
				Session.set("configFiles", result);
			});
			Meteor.call('getImageFiles', orgId, function(error, result) {
				Session.set("imageFiles", result);
			});
		});
	});
};



var destroyData = function() {
	Session.set("WorkFlow.Current");
	Session.set("groups");
	Session.set("profiles");
	Session.set("workflow.error");
	Session.set('workFlow.currentId');
	Session.set("configFiles");
	Session.set("imageFiles");
	triggerType.set('WorkFlowEventTrigger');
	currentType.set("WorkFlowOperationSummary");
	operationType.set("WorkFlowConfigFileDownload");
};


var getWorkFlowValueByKey = function(key) {
	var workflow = Session.get("WorkFlow.Current");
	return workflow[key];
};

var setWorkFlow = function(key, obj) {
	var workflow = Session.get("WorkFlow.Current");
	workflow[key] = obj;
	Session.set("WorkFlow.Current", workflow);
};

var checkDataIntegrity = function() {
	var current = Session.get("WorkFlow.Current");
	if (_.isArray(current.groups) && _.isArray(current.actions)) {
		return true;
	}
	return false;
};

var setButtonStatus = function(finish) {
	if (finish) {
		$('#bootstrap-wizard-1').find('.pager .next').hide();
		$('#bootstrap-wizard-1').find('.pager .finish').show();
		if (checkDataIntegrity()) {
			$('#bootstrap-wizard-1').find('.pager .finish').removeClass('disabled');
		}
	} else {
		$('#bootstrap-wizard-1').find('.pager .next').show();
		$('#bootstrap-wizard-1').find('.pager .finish').hide();
	}
};

var validateScheduler = function() {
	var validator = $('.workflow-policy').bootstrapValidator({
			message: 'This value is not valid',
			fields: {

				windowlength: {
					validators: {
						notEmpty: {
							message: 'windowlength cannot be empty'
						},
						digits: {
							message: 'windowlength is not a valid digits'
						}
					}
				}
			}
		})
		.data('bootstrapValidator');
	validator.validate();

	return validator.isValid();
};

var renderPocicyTemplate = function(templateName) {
	$('#triggerParams').empty();
	var t = UI.render(Template[templateName]);
	UI.insert(t, $('#triggerParams')[0]);
}

var validateData = function(index) {
	Session.set("workflow.error");

	if (index === 1) {
		if (!validateBasic()) {

			return false;
		}
		setWorkFlow('name', $('#inputName').val())
		setWorkFlow('description', $('#inputDescription').val())
	}
	if (index === 2) {
		if ($("input[type=checkbox]:checked").length === 0) {
			Session.set("workflow.error", "please select at least one device group");
			return false;
		}
		var groups = [];
		_.each($("input[type=checkbox]:checked"), function(group) {
			groups.push(group.id);
		})
		setWorkFlow('groups', groups);
	}
	if (index === 3) {
		var actions = getWorkFlowValueByKey('actions') || [];
		if (actions.length === 0) {
			Session.set("workflow.error", "please add at least one operation");
			return false;
		}
	}
	if (index === 4) {
		var policy;
		if (triggerType.get() === "WorkFlowSchedulerTrigger") {
			if (!validateScheduler()) {
				return false;
			}

			var startDate = $('#datepicker').data("DateTimePicker").date();

			var windowlength = $('#windowlength').val();

			policy = {
				"initialTrigger": {
					"type": "Maintenance Window"
				},
				"window": {
					"startDateTime": startDate.toISOString(),
					"windowLength": (parseInt(windowlength)) * 60,
					"recurringInterval": 1 * 24 * 3600,
					"maxRecurrence": 2000000
				}
			};
			renderPocicyTemplate("WorkFlowSchedulerTriggerSummary");
		} else {
			policy = {
				"initialTrigger": {
					"type": "CPE Event",
					"cpeEvent": "CC EVENT - New CPE Discovered"
				}
			};
			renderPocicyTemplate("WorkFlowEventTrigger");
		}
		setWorkFlow('execPolicy', policy);
	}
	$('#bootstrap-wizard-1').find('.form-wizard').children('li').eq(index - 1).addClass('complete');
	$('#bootstrap-wizard-1').find('.form-wizard').children('li').eq(index - 1).find('.step').html('<i class="fa fa-check"></i>');
	return true;
};

var containsId = function(curr, Ids) {
	var find = false;
	_.each(Ids, function(id) {
		if (curr._id === id) {
			find = true;
			return;
		}
	})
	return find;
};

var waitCurrent = function(callback) {
	var current = Session.get("WorkFlow.Current");
	if (!current) {
		Meteor.setTimeout(function() {
			waitCurrent(callback);
		}, 100);
	} else {
		callback();
	}
};

var renderTriggerTemplate = function() {
	var current = Session.get("WorkFlow.Current");
	if (current && current.execPolicy && current.execPolicy.initialTrigger) {
		var triggerType = Session.get("WorkFlow.Current").execPolicy.initialTrigger.type;
		if (triggerType === "Maintenance Window") {
			renderPocicyTemplate("WorkFlowSchedulerTriggerSummary");
		} else {
			renderPocicyTemplate("WorkFlowEventTrigger");
		}
	}
};

var currentType = new Blaze.ReactiveVar('WorkFlowOperationSummary');

var triggerType = new Blaze.ReactiveVar('WorkFlowEventTrigger');

var operationType = new Blaze.ReactiveVar('WorkFlowConfigFileDownload');

var operationParamUnAvailable = new Blaze.ReactiveVar(true);

var tempAction;

Template.WorkflowWizard.created = function() {
	var orgId = Utils.getOrgId();
	Session.set("WorkFlow.Current", {
		orgId: orgId
	});
	prepareData(orgId);
};


Template.WorkflowWizard.destroyed = function() {
	destroyData();
};

Template.WorkflowWizard.rendered = function() {
	$('#bootstrap-wizard-1').bootstrapWizard({
		'tabClass': 'form-wizard',
		'onTabClick': function(tab, navigation, index) {
			index++;
			return validateData(index);
		},
		'onTabShow': function(tab, navigation, index) {
			if (index >= 4) {
				setButtonStatus(true);
			} else {
				setButtonStatus(false);
			}
		},
		'onNext': function(tab, navigation, index) {
			return validateData(index);
		}
	});
};

Template.WorkflowWizard.helpers({

	error: function() {
		return Session.get("workflow.error");
	}

});

Template.WorkFlowDeviceGroup.helpers({

	groups: function() {
		return Session.get("groups");
	}

});


Template.WorkFlowOperations.helpers({
	getTemplate: function() {
		return currentType.get();
	}
});

var getActionName = function() {
	var type = this.actionType,
		profileId, fileId, profiles, configFiles, imageFiles,findProfile, findFile;
	if (type === "Apply Configuration Profile") {
		profiles = Session.get("profiles");
		if (profiles) {
			profileId = this.profileId;
			_.each(profiles, function(profile) {
				if (profileId === profile._id) {
					findProfile = profile;
				}
			})
			return findProfile.name;
		}
	} else if (type === "Download Configuration File") {
		configFiles = Session.get("configFiles");
		if (configFiles) {
			fileId = this.fileId;
			_.each(configFiles, function(configFile) {
				if (fileId === configFile._id) {
					findFile = configFile;
				}
			})
			return findFile.name;
		}
	} else if (type === "Download SW/FW Image") {
		imageFiles = Session.get("imageFiles");
		if (imageFiles) {
			fileId = this.fileId;
			_.each(imageFiles, function(imageFile) {
				if (fileId === imageFile._id) {
					findFile = imageFile;
				}
			})
			return findFile.name;
		}
	}
};

Template.WorkFlowOperationSummary.helpers({
	operations: function() {
		return Session.get("WorkFlow.Current").actions;
	},
	getActionName: getActionName
});

Template.WorkFlowOperationParam.helpers({

	getTemplate: function() {
		return operationType.get();
	},

	unAvailable: function() {
		return operationParamUnAvailable.get();
	}

});


Template.WorkFlowProfile.helpers({
	availableProfiles: function() {
		var actions = getWorkFlowValueByKey('actions') || [];
		var selected = [];
		_.each(actions,function(action){
			if(action.actionType === "Apply Configuration Profile"){
				selected.push(action.profileId);
			}
		})
		var profiles = Session.get("profiles");
		var available_profiles = _.reject(profiles, function(profile) {
			return containsId(profile, selected);
		});
		return available_profiles;
	}
});

Template.WorkFlowProfile.events({

	'change input[type="radio"]': function(event) {
		event.preventDefault();
		operationParamUnAvailable.set();
		tempAction = {
			"actionType": "Apply Configuration Profile",
			"profileId": $("input[type=radio]:checked")[0].id
		};
	}

});

Template.WorkFlowConfigFileDownload.helpers({

	availableConfigFiles: function() {
		var actions = getWorkFlowValueByKey('actions') || [];
		var selected = [];
		_.each(actions,function(action){
			if(action.actionType === "Download Configuration File"){
				selected.push(action.fileId);
			}
		})
		var files = Session.get("configFiles");
		var available_files = _.reject(files, function(file) {
			return containsId(file, selected);
		});
		return available_files;
	}

});

Template.WorkFlowConfigFileDownload.events({

	'change input[type="radio"]': function(event) {
		event.preventDefault();
		operationParamUnAvailable.set();
		tempAction = {
			"actionType": "Download Configuration File",
			"fileId": $("input[type=radio]:checked")[0].id
		};
	}

});


Template.WorkFlowImageFileDownload.helpers({

	availableImageFiles: function() {
		var actions = getWorkFlowValueByKey('actions') || [];
		var selected = [];
		_.each(actions,function(action){
			if(action.actionType === "Download SW/FW Image"){
				selected.push(action.fileId);
			}
		})
		var files = Session.get("imageFiles");
		var available_files = _.reject(files, function(file) {
			return containsId(file, selected);
		});
		return available_files;
	}

});



Template.WorkFlowImageFileDownload.events({

	'change input[type="radio"]': function(event) {
		event.preventDefault();
		operationParamUnAvailable.set();
		tempAction = {
			"actionType": "Download SW/FW Image",
			"fileId": $("input[type=radio]:checked")[0].id
		};
	}

});


Template.WorkFlowTrigger.helpers({

	getTemplate: function() {
		return triggerType.get();
	}

});

Template.WorkFlowSchedulerTrigger.rendered = function() {
	$('#datepicker').datetimepicker();
	$('#datepicker').data("DateTimePicker").date(new Date());
};



Template.WorkflowWizard.events({

	'click li.finish': function(event) {
		event.preventDefault();
		var current = Session.get("WorkFlow.Current");
		Meteor.call('workflowExecute', current, function(error, result) {
			if (error) {
				Session.set("workflow.error", error.reason);
			} else {
				Router.go('netop-workflows');
			}
		});
	},

	'click li.cancel': function(event) {
		event.preventDefault();
		Router.go('netop-workflows');
	},

	'click #btn-newOperation': function(event) {
		event.preventDefault();
		currentType.set("WorkFlowOperationParam");
		operationType.set("WorkFlowConfigFileDownload");
		operationParamUnAvailable.set(true);
	},

	'change select[id="inputOperationType"]': function(event) {
		operationType.set(event.currentTarget.value);
	},

	'click #btn-doneOperation': function(event) {
		event.preventDefault();
		var actions;
		if(tempAction){
			actions = getWorkFlowValueByKey('actions') || [];
			actions.push(tempAction);
			setWorkFlow('actions', actions);
		}
		currentType.set("WorkFlowOperationSummary");
		operationType.set("WorkFlowConfigFileDownload")
	},

	'click #btn-discardOperation': function(event) {
		event.preventDefault();
		tempAction = null;
		currentType.set("WorkFlowOperationSummary");
		operationType.set("WorkFlowConfigFileDownload")
	},

	'click .fa-trash-o': function(event) {
		var actions = getWorkFlowValueByKey('actions')
		var rowIndex = $(event.currentTarget).closest('tr').index();
		actions.splice(rowIndex, 1);
		setWorkFlow('actions', actions);
	},

	'change select[id="inputTriggerType"]': function(event) {
		triggerType.set(event.currentTarget.value);
	}

});

Template.workflowDetail.created = function() {
	var orgId = Utils.getOrgId();
	var workflowid = Session.get('workFlow.currentId');
	var current = Session.get("WorkFlow.Current");
	if (workflowid && !current) {
		Meteor.call('workflowQuery', workflowid, function(error, result) {
			Session.set("WorkFlow.Current", result);
			prepareData(orgId);
		});
	}
};

Template.workflowDetail.destroyed = function() {
	destroyData();
};

Template.WorkFlowSchedulerTriggerSummary.rendered = function() {
	var current = Session.get("WorkFlow.Current"),
		triggerType, startTime;
	if (current && current.execPolicy && current.execPolicy.initialTrigger) {
		triggerType = Session.get("WorkFlow.Current").execPolicy.initialTrigger.type;
		$('#datepicker-sum').datetimepicker();
		startTime = moment(current.execPolicy.window.startDateTime, moment.ISO_8601);
		$('#datepicker-sum').data("DateTimePicker").date(startTime);
		$('#windowlength-summary').val(current.execPolicy.window.windowLength / 60);
	}
};


Template.workflowDetail.rendered = function() {
	waitCurrent(renderTriggerTemplate);
};

Template.workflowDetail.helpers({
	current: function() {

		return Session.get("WorkFlow.Current");
	},
	groupsInCurrent: function() {

		var curr_groups = Session.get("WorkFlow.Current").groups;

		var groups = Session.get("groups");

		curr_groups = _.filter(groups, function(group) {
			return containsId(group, curr_groups)
		});

		return curr_groups;
	},
	actionsInCurrent: function() {
		return Session.get("WorkFlow.Current").actions;
	},
	getActionName: getActionName
});
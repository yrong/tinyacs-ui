var orgId,serialNumber;

var portmapping_apps;

var loadData = function() {

	orgId = Utils.getOrgId() || '50';
	serialNumber = Utils.getSerialNumber();

	Session.set("summaryPage", true);
	Session.set("security.loading", true);

	Meteor.call('portMappingApps', orgId, function(error, result) {
		if (error) {
			Session.set('security.error', error.reason);
			Session.set('security.loading', false);
		} else {
			portmapping_apps = result;
			Meteor.call('lanHostGet', orgId, {
				"serialNumber": serialNumber
			}, function(error, result) {
				if (error) {
					Session.set('security.error', error.reason);
					Session.set('security.loading', false);
				} else {
					Session.set("lanhosts", result);
					Meteor.call('portMappingGet', orgId, {
						"serialNumber": serialNumber
					}, function(error, result) {
						if (error) {
							Session.set('security.error', error.reason);
							Session.set('security.loading', false);
						} else {
							Session.set("mappings", result);
							Session.set("summaryPage", true);
							Session.set("security.loading", false);
						}

					});
				}
			});
		}

	});
};

var releaseData = function() {
	Session.set('security.error');
};


// ROUTE CONTROLLER

SecurityController = RouteController.extend({
  template: 'security'
});

Template.security.created = function() {
	loadData();
};

Template.security.destroyed = function() {
	releaseData();
};


var lanHosts = function() {
	var result = Session.get("lanhosts");
	var lanhosts = [];
	if (result) {
		_.each(result.hosts, function(val, key) {
			lanhosts.push({
				instance: key,
				value: val
			});
		});
	}
	return lanhosts;
};

var getHostNameFromIP = function(ipaddress) {
	var hostname = ipaddress;
	var hosts = Session.get("lanhosts");
	if (hosts) {
		_.each(hosts.hosts, function(val, key) {
			if (val.IPAddress === ipaddress) {
				hostname=val.HostName || val.IPAddress;
			}
		});
	}
	return hostname;
};

var cpeMappingsObj = function() {
	var result = Session.get("mappings");
	var mappings = {};
	if(result){
		_.each(result.mappings, function(val, key) {
			var name = val.PortMappingDescription + val.InternalClient;
			if(_.has(mappings,name)){
				mappings[name].push({index:key,value:val});
			}else{
				mappings[name] = [];
				mappings[name].push({index:key,value:val})
			}
		});
	}
	return mappings;
}

var cpeMappings = function() {
	var mappings = cpeMappingsObj();
	var result = _.map(mappings, function(val, key) {
		return {
			PortMappingDescription: val[0].value.PortMappingDescription,
			InternalClient:val[0].value.InternalClient,
			value: val
		}
	});
	return result;
};

var PortMappingInstance = function() {
	var instances = [];
	_.each(this.value,function(val){
		instances.push(val.index);
	});
	return instances;
};

var PortInfo = function() {
	var val = this.value;
	var info = '';
	if (val.ExternalPort === val.X_BROADCOM_COM_ExternalPortEnd) {
		info += val.PortMappingProtocol + ":" + val.ExternalPort;
	} else if (val.ExternalPort === val.InternalPort && val.X_BROADCOM_COM_ExternalPortEnd === val.X_BROADCOM_COM_InternalPortEnd) {
		info += val.PortMappingProtocol + ":" + val.ExternalPort + "-" + val.X_BROADCOM_COM_ExternalPortEnd;
	} else {
		info += val.PortMappingProtocol + ":" + val.ExternalPort + "-" + val.X_BROADCOM_COM_ExternalPortEnd + "(" + val.InternalPort + ")";
	}
	return info;
};

var acsMappings = function() {
	//return Apps.find().fetch();
	return portmapping_apps;
};

var availableMappings = function() {
	var cpeMappings_ = cpeMappingsObj();
	var acsMappings_ = acsMappings();
	/*var availableMappings = _.reject(acsMappings_,function(mapping){
		return _.has(cpeMappings_,mapping.PortMappingDescription);
	});*/
	var availableMappings = acsMappings_;
	return availableMappings;
};

var getMappingByName = function(name) {
	var mappings = acsMappings();
	var found;
	_.each(mappings,function(map){
		if(map.PortMappingDescription === name) {
			found  = map;
		}
	})
	return found;
};

var isAppExisted = function() {
	var mapping = Session.get("selected");
	return _.has(mapping,'PortMappingDescription');
};

var successCallback = function(results) {
	var mappings = Session.get("mappings");
	mappings.mappings = mappings.mappings || {};
	_.each(results,function(result){
		mappings.mappings[result.index] = result.obj;
	});
	
	Session.set("mappings", mappings);
	Session.set("summaryPage", true);
	Session.set("loading", false);
};

var validate = function() {
	var validator = $('.form-horizontal').bootstrapValidator({
			message: sxa.systemUtil.getLabel("valueNotValid"),
			fields: {
				inputNewApplication: {
					validators: {
						notEmpty: {
						},
						stringLength: {
							message: sxa.systemUtil.getLabel("securityConfigNameLength"),
							min: 4,
							max: 20
						},
						regexp: {
							regexp: /^[a-zA-Z0-9_\s]+$/,
							message: sxa.systemUtil.getLabel("securityConfigNameChar")
						},
						callback: {
							callback: function(value, validator, $field) {
								var cpeMappings = cpeMappingsObj();
								if (_.has(cpeMappings,value)) {
									return {
										valid: false,
										message: sxa.systemUtil.getLabel("securityConfigNameExists")
									};
								}
								return true;
							}
						} 
					}
				},
				inputStartPort: {
					validators: {
						notEmpty: {
						},
						digits: {
						},
						between: {
							message: sxa.systemUtil.getLabel("securityConfigPortRange"),
							min: 1,
							max: 65535
						}
					}
				},
				inputEndPort: {
					validators: {
						digits: {
						},
						callback: {
							callback: function(value, validator, $field) {
								var startPort = $("#inputStartPort").val();
								if (parseInt(value) < parseInt(startPort)) {
									return {
										valid: false,
										message: sxa.systemUtil.getLabel("securityConfigEndPortGreater")
									}
								}
								return true;
							}
						},
						between: {
							message: sxa.systemUtil.getLabel("securityConfigPortRange"),
							min: 1,
							max: 65535
						}
					}
				},
				inputTargetPort: {
					validators: {
						digits: {
						},
						between: {
							message: sxa.systemUtil.getLabel("securityConfigPortRange"),
							min: 1,
							max: 65535
						}
					}
				},
				inputLanHost: {
					validators: {
						notEmpty: {
						}
					}
				}
			}
		})
		.data('bootstrapValidator');
	validator.validate();

	return validator.isValid();
};

Template.security.rendered = function() {
	SmartAdmin.pageSetup();
};

Template.security.helpers({
	lanHosts: lanHosts,
	hostName: function(){
		return this.value.HostName || this.value.IPAddress;
	},
	summaryPage: function(){
		return Session.get("summaryPage") === true;
	},
	loading: function(){
		return Session.get("security.loading") === true;
	},
	error: function() {
		return Session.get("security.error");
	},
	disabled: function(){
		return Session.get("security.loading") === true || Session.get("security.error");
	},
	selected: function(){
		return Session.get("selected");
	},
	isSame: function(name, value) {
		return this[name] === value;
	},
	mappingsSelected:function(){
		return this.PortRange;
	},
	cpeMappings: cpeMappings,
	isExisted: isAppExisted,
	PortMappingInstance:PortMappingInstance,
	availableMappings:availableMappings,
	PortInfo:PortInfo,
	getHostNameFromIP:getHostNameFromIP
});

Template.security.events({

    'click button[id="new"]': function(event) {
        event.preventDefault();
        Session.set("summaryPage",false);
		Meteor.setTimeout(function() {
			var mapping = getMappingByName($("#inputApplication").val());
			Session.set('selected',mapping);
			$("#inputApplication").select2();
		}, 0);
              
    },

    'click button[type="cancel"]': function(event) {
        event.preventDefault();
        Session.set("summaryPage",true);
    },

    'change select[id="inputApplication"]': function(event) {
    	if(event.currentTarget.value === 'New Entry'){
        	Session.set("selected",{});
    	}else{
    		var mapping = getMappingByName($("#inputApplication").val());
			Session.set('selected',mapping);
    	}    
    },

    'click button[type="submit"]': function(event) {
        event.preventDefault();
        var mappings = Session.get("mappings");
        var path = mappings.path;
		if (isAppExisted()) {
			var valueobj = getMappingByName($("#inputApplication").val());
			valueobj.InternalClient = $("#inputLanHost").val();
			valueobj.PortMappingEnabled = true;
			if (validate()){
				Session.set("security.loading", true);
				Meteor.call('portMappingAdd', orgId, serialNumber, path, valueobj, function(error, result) {
					if (error) {
						Session.set('security.error', error.reason);
					} else {
						successCallback(result);
					}
					Session.set('security.loading', false);				
				});
			}
			
		} else {//new app
			var name = $("#inputNewApplication").val();
			var protocal = $("#inputProtocol").val();
			var startPort = $("#inputStartPort").val();
			var endPort = $("#inputEndPort").val();
			var targetPort = $("#inputTargetPort").val();
			if(endPort === '') {
				endPort = startPort;
			}
			var targetEndPort = targetPort;
			if(targetPort === '') {
				targetPort = startPort;
				targetEndPort = endPort;
			}
			var PortRange = [{
				PortMappingProtocol: protocal,
				ExternalPort: startPort,
				X_BROADCOM_COM_ExternalPortEnd: endPort,
				InternalPort: targetPort,
				X_BROADCOM_COM_InternalPortEnd: targetEndPort
			}];
			/*
			if (protocal === 'TCP/UDP') {
				PortRange = [{
					PortMappingProtocol: 'TCP',
					ExternalPort: startPort,
					X_BROADCOM_COM_ExternalPortEnd: endPort,
					InternalPort: targetPort,
					X_BROADCOM_COM_InternalPortEnd: targetEndPort,
				}, {
					PortMappingProtocol: 'UDP',
					ExternalPort: startPort,
					X_BROADCOM_COM_ExternalPortEnd: endPort,
					InternalPort: targetPort,
					X_BROADCOM_COM_InternalPortEnd: targetEndPort,
				}];
			}*/
			var host = $("#inputLanHost").val();
			var valueobj = {
				PortMappingEnabled: true,
				PortMappingDescription: name,
				PortRange: PortRange,
				InternalClient: host				
			};

			if (validate()) {
				Session.set("security.loading", true);
				Meteor.call('portMappingAdd', orgId, serialNumber, path, valueobj, function(error, result) {
					if (error) {
						Session.set('security.error', error.reason);
					}else{
						successCallback(result);
					}
					Session.set('security.loading', false);	
				});
			}
		}
    },

	'click .fa-trash-o': function(event) {

		var instances = $(event.currentTarget).data("instance").toString();
		var mappings = Session.get("mappings");
		var path = mappings.path;
		Session.set("security.loading",true);
		Meteor.call('portMappingDel', orgId, serialNumber, path, instances,function(error, result) {
			if (error) {
				Session.set('security.error', error.reason);
			} else {
				var instanceArray = instances.split(",");
				_.each(instanceArray, function(instance) {
					delete mappings.mappings[instance];
				});
				Session.set("mappings", mappings);
			}
			Session.set("security.loading", false);
		});
	}
  
});

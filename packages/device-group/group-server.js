// exposed/exported for user in other packages.  May want to relocate
FilteredDevices = new Meteor.Collection("sxacc-devices");

var groupUrlPrefix = AcsNbi.nbiPrefix() + 'cc/group?orgId=';

var deviceTypeUrlPrefix = AcsNbi.nbiPrefix()+ 'cc/device-type';


Meteor.methods({
	groupGet: function(orgId) {
		try {
			this.unblock();
			return HTTP.call('GET', groupUrlPrefix+orgId).data;
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},
	groupAdd: function(orgId,group) {
		try {
			this.unblock();
			return HTTP.call('POST', groupUrlPrefix + orgId, {
				data: group
			})
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},
	groupModify: function(orgId,group) {
		try {
			this.unblock();
			return HTTP.call('PUT', groupUrlPrefix + orgId, {
				data: group
			})
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},
	groupDelete: function(orgId,id) {
		try {
			this.unblock();
			return HTTP.call('DELETE', groupUrlPrefix + orgId + '&_id=' + id);
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},
	deviceTypeGet: function(orgId) {
		try {
			this.unblock();
			return HTTP.call('GET', deviceTypeUrlPrefix, {
				data: {
					orgId: orgId
				}
			}).data;
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},
	getCountInfo: function(cpeFilter,limit) {
		try{
			var count = FilteredDevices.find(cpeFilter).count();
			var pagenum = Math.ceil(count / limit);
			return {id:JSON.stringify(cpeFilter),count:count,pagenum:pagenum};
		} catch(error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},
	getCpes: function(cpeFilter,page,limit,sort) {
		try {
			var results = FilteredDevices.find(cpeFilter, {
				skip: (page - 1) * limit,
				limit: limit,
				sort: sort
			});
			return {
				id: JSON.stringify(cpeFilter),
				result: results.fetch()
			};
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}	
	}
});
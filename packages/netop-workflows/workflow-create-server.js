var configProfileUrlPrefix = AcsNbi.nbiPrefix() + 'cc/configuration-profile?orgId=';

var workFlowUrlPrefix = AcsNbi.nbiPrefix()+ 'cc/workflow';


Meteor.methods({
	profilesGet: function(orgId) {
		try {
			this.unblock();
			var result = HTTP.call('GET', configProfileUrlPrefix + orgId);
			return result.data;
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},

	workflowExecute: function(workflow) {
		try {
			this.unblock();
			var result = HTTP.call('POST', workFlowUrlPrefix, {
				'data': workflow
			});
			return result.data;
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},

	workflowQuery: function(workflowid) {
		try {
			this.unblock();
			var result = HTTP.call('GET', workFlowUrlPrefix + "/" + workflowid);
			return result.data;
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},

	getImageFiles: function(orgId, serialNumber) {
		this.unblock();
		var cpeId;
		if (serialNumber) {
			cpeId = Utils.buildCpeId(serialNumber);
		}
		return AcsNbi.getFiles.call(this, orgId, cpeId, 'SW/FW Image');
	}
})
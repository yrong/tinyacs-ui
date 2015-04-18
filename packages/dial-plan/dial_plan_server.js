var dialPlanUrlPrefix = AcsNbi.nbiPrefix() + 'cc/dial-plan';

Meteor.methods({

	dialPlanDelete: function(orgId, id) {
		try {
			this.unblock();		
			return HTTP.call('DELETE', dialPlanUrlPrefix + '/' + id);
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},

	dialPlanAddUpate: function(orgId, dialplan) {
		try {
			this.unblock();
			if (_.has(dialplan, '_id')) {
				return HTTP.call('PUT', dialPlanUrlPrefix + '/' + dialplan._id + '?orgId=' + orgId, {
					data: dialplan
				});
			}else{
				return HTTP.call('POST', dialPlanUrlPrefix + '?orgId=' + orgId, {
					data: dialplan
				});
			}
			
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	}
});
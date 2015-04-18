var orgUrlPrefix = AcsNbi.nbiPrefix() + 'cc/organization';

Meteor.methods({
	getFileServer: function(orgId) {
		try {
			this.unblock();
			return HTTP.call('GET', orgUrlPrefix + '/' + orgId).data;
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},

	fileServerDelete: function(orgId, id) {
		try {
			this.unblock();
			var organization = HTTP.call('GET', orgUrlPrefix + '/' + orgId).data;
			delete organization.externalImageServer;
			return HTTP.call('PUT', orgUrlPrefix, {
				data: organization
			});
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},

	fileServerAddUpate: function(orgId, fileserver) {
		try {
			this.unblock();
			var organization = HTTP.call('GET', orgUrlPrefix + '/' + orgId).data;
			organization.externalImageServer = fileserver;
			return HTTP.call('PUT', orgUrlPrefix, {
				data: organization
			});
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	}
});
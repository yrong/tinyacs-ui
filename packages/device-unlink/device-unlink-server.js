var unlinkDeviceUrlPrefix = AcsNbi.nbiPrefix() + 'cc/device';

Meteor.methods({
	getUnlinkDeviceCount: function(orgId) {
		try {
			this.unblock();
			return HTTP.call('GET', unlinkDeviceUrlPrefix + '/count?unlinked=true&orgId=' + orgId).data;
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	},

	getUnlinkDevice: function(orgId, cpeId, pageNumber, pageLength) {
		try {
			this.unblock();
			return HTTP.call('GET', unlinkDeviceUrlPrefix + '?unlinked=true&orgId=' + orgId + '&skip=' + (pageNumber - 1) * pageLength + '&limit=' + pageLength).data;
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	}
});

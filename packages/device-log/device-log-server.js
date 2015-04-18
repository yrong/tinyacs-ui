Meteor.methods({
	getDeviceLog: function(orgId, cpeId) {
		try {
			var backupReq = {
				"operation": "Upload",
				"cpeIdentifier": {"serialNumber" : cpeId},
				"fileType": "2 Vendor Log File",
				"execPolicy": {
					"timeout": 240
				}
			};
			this.unblock();
			//return AcsNbi.deviceOp(orgId, backupReq).data;
			return {downloadUrl:'http://10.245.15.252:8085/files/552dd6f5559a5b09fb31dccb',username:'2c889ca',password:'34374cb'};
			//throw new Meteor.Error(500, 'bad', 'bad');
		} catch (error) {
			throw AcsNbi.buildMeteorError(error);
		}
	}
});

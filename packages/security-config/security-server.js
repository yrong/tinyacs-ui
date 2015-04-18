//var DotObject = Npm.require('dot-object');

//var Future = Npm.require('fibers/future')

var Apps = new Meteor.Collection("sxacc-port-mapping-apps");

var initApps =
	[{
		"PortMappingDescription": "Call of Duty",
		"PortRange": [{
			"ExternalPort": 28960,
			"X_BROADCOM_COM_ExternalPortEnd": 28960,
			"InternalPort": 28960,
			"X_BROADCOM_COM_InternalPortEnd": 28960,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "Call of Duty 2",
		"PortRange": [{
			"ExternalPort": 28960,
			"X_BROADCOM_COM_ExternalPortEnd": 28960,
			"InternalPort": 28960,
			"X_BROADCOM_COM_InternalPortEnd": 28960,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "Call of Duty 4",
		"PortRange": [{
			"ExternalPort": 28960,
			"X_BROADCOM_COM_ExternalPortEnd": 28960,
			"InternalPort": 28960,
			"X_BROADCOM_COM_InternalPortEnd": 28960,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "Xbox 360 Heist",
		"PortRange": [{
			"ExternalPort": 3074,
			"X_BROADCOM_COM_ExternalPortEnd": 3074,
			"InternalPort": 3074,
			"X_BROADCOM_COM_InternalPortEnd": 3074,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "Warcraft II",
		"PortRange": [{
			"ExternalPort": 6112,
			"X_BROADCOM_COM_ExternalPortEnd": 6119,
			"InternalPort": 6112,
			"X_BROADCOM_COM_InternalPortEnd": 6119,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "DirectX Multimedia Control",
		"PortRange": [{
			"ExternalPort": 2300,
			"X_BROADCOM_COM_ExternalPortEnd": 2400,
			"InternalPort": 2300,
			"X_BROADCOM_COM_InternalPortEnd": 2400,
			"PortMappingProtocol": "TCP or UDP"
		},{
			"ExternalPort": 47624,
			"X_BROADCOM_COM_ExternalPortEnd": 47624,
			"InternalPort": 47624,
			"X_BROADCOM_COM_InternalPortEnd": 47624,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 6073,
			"X_BROADCOM_COM_ExternalPortEnd": 6073,
			"InternalPort": 6073,
			"X_BROADCOM_COM_InternalPortEnd": 6073,
			"PortMappingProtocol": "UDP"
		}]
	},{
		"PortMappingDescription": "DirectTV STB 1 Multimedia Service",
		"PortRange": [{
			"ExternalPort": 27161,
			"X_BROADCOM_COM_ExternalPortEnd": 27163,
			"InternalPort": 27161,
			"X_BROADCOM_COM_InternalPortEnd": 27163,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "DirectTV STB 2 Multimedia Service",
		"PortRange": [{
			"ExternalPort": 27164,
			"X_BROADCOM_COM_ExternalPortEnd": 27166,
			"InternalPort": 27164,
			"X_BROADCOM_COM_InternalPortEnd": 27166,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "DirectTV STB 3 Multimedia Service",
		"PortRange": [{
			"ExternalPort": 27167,
			"X_BROADCOM_COM_ExternalPortEnd": 27169,
			"InternalPort": 27167,
			"X_BROADCOM_COM_InternalPortEnd": 27169,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "DNS Domain Name Service",
		"PortRange": [{
			"ExternalPort": 53,
			"X_BROADCOM_COM_ExternalPortEnd": 53,
			"InternalPort": 53,
			"X_BROADCOM_COM_InternalPortEnd": 53,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "FTP File Transfer",
		"PortRange": [{
			"ExternalPort": 20,
			"X_BROADCOM_COM_ExternalPortEnd": 21,
			"InternalPort": 20,
			"X_BROADCOM_COM_InternalPortEnd": 21,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "FTPS Secure File Transfer",
		"PortRange": [{
			"ExternalPort": 990,
			"X_BROADCOM_COM_ExternalPortEnd": 990,
			"InternalPort": 990,
			"X_BROADCOM_COM_InternalPortEnd": 990,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "H323 Video",
		"PortRange": [{
			"ExternalPort": 1720,
			"X_BROADCOM_COM_ExternalPortEnd": 1720,
			"InternalPort": 1720,
			"X_BROADCOM_COM_InternalPortEnd": 1720,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "HTTP Web Service",
		"PortRange": [{
			"ExternalPort": 80,
			"X_BROADCOM_COM_ExternalPortEnd": 80,
			"InternalPort": 80,
			"X_BROADCOM_COM_InternalPortEnd": 80,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "HTTPS Secure Web Service",
		"PortRange": [{
			"ExternalPort": 443,
			"X_BROADCOM_COM_ExternalPortEnd": 443,
			"InternalPort": 443,
			"X_BROADCOM_COM_InternalPortEnd": 443,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "IMAP Mail Service",
		"PortRange": [{
			"ExternalPort": 143,
			"X_BROADCOM_COM_ExternalPortEnd": 143,
			"InternalPort": 143,
			"X_BROADCOM_COM_InternalPortEnd": 143,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "IMAPS Mail Service",
		"PortRange": [{
			"ExternalPort": 993,
			"X_BROADCOM_COM_ExternalPortEnd": 993,
			"InternalPort": 993,
			"X_BROADCOM_COM_InternalPortEnd": 993,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "IPP Remote Printing",
		"PortRange": [{
			"ExternalPort": 631,
			"X_BROADCOM_COM_ExternalPortEnd": 631,
			"InternalPort": 631,
			"X_BROADCOM_COM_InternalPortEnd": 631,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "IPSEC VPN Service",
		"PortRange": [{
			"ExternalPort": 50,
			"X_BROADCOM_COM_ExternalPortEnd": 50,
			"InternalPort": 50,
			"X_BROADCOM_COM_InternalPortEnd": 50,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 51,
			"X_BROADCOM_COM_ExternalPortEnd": 500,
			"InternalPort": 51,
			"X_BROADCOM_COM_InternalPortEnd": 500,
			"PortMappingProtocol": "UDP"
		}]
	},{
		"PortMappingDescription": "IRC Chat Service",
		"PortRange": [{
			"ExternalPort": 113,
			"X_BROADCOM_COM_ExternalPortEnd": 113,
			"InternalPort": 113,
			"X_BROADCOM_COM_InternalPortEnd": 113,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 194,
			"X_BROADCOM_COM_ExternalPortEnd": 194,
			"InternalPort": 194,
			"X_BROADCOM_COM_InternalPortEnd": 194,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 1024,
			"X_BROADCOM_COM_ExternalPortEnd": 1034,
			"InternalPort": 1024,
			"X_BROADCOM_COM_InternalPortEnd": 1034,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 6661,
			"X_BROADCOM_COM_ExternalPortEnd": 7000,
			"InternalPort": 6661,
			"X_BROADCOM_COM_InternalPortEnd": 7000,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "L2TP VPN Service",
		"PortRange": [{
			"ExternalPort": 1701,
			"X_BROADCOM_COM_ExternalPortEnd": 1701,
			"InternalPort": 1701,
			"X_BROADCOM_COM_InternalPortEnd": 1701,
			"PortMappingProtocol": "UDP"
		}]
	},{
		"PortMappingDescription": "MSN Gaming Service",
		"PortRange": [{
			"ExternalPort": 28800,
			"X_BROADCOM_COM_ExternalPortEnd": 29100,
			"InternalPort": 28800,
			"X_BROADCOM_COM_InternalPortEnd": 29100,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "MySQL Database Management",
		"PortRange": [{
			"ExternalPort": 3306,
			"X_BROADCOM_COM_ExternalPortEnd": 3306,
			"InternalPort": 3306,
			"X_BROADCOM_COM_InternalPortEnd": 3306,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "NNTP Newsgroup",
		"PortRange": [{
			"ExternalPort": 119,
			"X_BROADCOM_COM_ExternalPortEnd": 119,
			"InternalPort": 119,
			"X_BROADCOM_COM_InternalPortEnd": 119,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "NTP Network Time",
		"PortRange": [{
			"ExternalPort": 123,
			"X_BROADCOM_COM_ExternalPortEnd": 123,
			"InternalPort": 123,
			"X_BROADCOM_COM_InternalPortEnd": 123,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "Oracle SQL Database Management",
		"PortRange": [{
			"ExternalPort": 66,
			"X_BROADCOM_COM_ExternalPortEnd": 66,
			"InternalPort": 66,
			"X_BROADCOM_COM_InternalPortEnd": 66,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 1525,
			"X_BROADCOM_COM_ExternalPortEnd": 1525,
			"InternalPort": 1525,
			"X_BROADCOM_COM_InternalPortEnd": 1525,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "PC Anywhere Remote Management",
		"PortRange": [{
			"ExternalPort": 66,
			"X_BROADCOM_COM_ExternalPortEnd": 66,
			"InternalPort": 66,
			"X_BROADCOM_COM_InternalPortEnd": 66,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 1525,
			"X_BROADCOM_COM_ExternalPortEnd": 1525,
			"InternalPort": 1525,
			"X_BROADCOM_COM_InternalPortEnd": 1525,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 5631,
			"X_BROADCOM_COM_ExternalPortEnd": 5631,
			"InternalPort": 5631,
			"X_BROADCOM_COM_InternalPortEnd": 5631,
			"PortMappingProtocol": "TCP or UDP"
		},{
			"ExternalPort": 5532,
			"X_BROADCOM_COM_ExternalPortEnd": 5532,
			"InternalPort": 5532,
			"X_BROADCOM_COM_InternalPortEnd": 5532,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "PPTP VPN Service All GRE",
		"PortRange": [{
			"ExternalPort": 1723,
			"X_BROADCOM_COM_ExternalPortEnd": 1723,
			"InternalPort": 1723,
			"X_BROADCOM_COM_InternalPortEnd": 1723,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "PPTP VPN Service All GRE",
		"PortRange": [{
			"ExternalPort": 1723,
			"X_BROADCOM_COM_ExternalPortEnd": 1723,
			"InternalPort": 1723,
			"X_BROADCOM_COM_InternalPortEnd": 1723,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "POP3 Mail Service",
		"PortRange": [{
			"ExternalPort": 110,
			"X_BROADCOM_COM_ExternalPortEnd": 110,
			"InternalPort": 110,
			"X_BROADCOM_COM_InternalPortEnd": 110,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "POP3S Secure Mail Service",
		"PortRange": [{
			"ExternalPort": 995,
			"X_BROADCOM_COM_ExternalPortEnd": 995,
			"InternalPort": 995,
			"X_BROADCOM_COM_InternalPortEnd": 995,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "PS2/PS3 Game Console",
		"PortRange": [{
			"ExternalPort": 4658,
			"X_BROADCOM_COM_ExternalPortEnd": 4659,
			"InternalPort": 4658,
			"X_BROADCOM_COM_InternalPortEnd": 4659,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "RIP Web Service",
		"PortRange": [{
			"ExternalPort": 520,
			"X_BROADCOM_COM_ExternalPortEnd": 520,
			"InternalPort": 520,
			"X_BROADCOM_COM_InternalPortEnd": 520,
			"PortMappingProtocol": "UDP"
		}]
	},{
		"PortMappingDescription": "REAL A/V Audio/Video",
		"PortRange": [{
			"ExternalPort": 7070,
			"X_BROADCOM_COM_ExternalPortEnd": 7070,
			"InternalPort": 7070,
			"X_BROADCOM_COM_InternalPortEnd": 7070,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "Real Server/Quick Time Audio/Video",
		"PortRange": [{
			"ExternalPort": 7070,
			"X_BROADCOM_COM_ExternalPortEnd": 7070,
			"InternalPort": 7070,
			"X_BROADCOM_COM_InternalPortEnd": 7070,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 6970,
			"X_BROADCOM_COM_ExternalPortEnd": 7170,
			"InternalPort": 6970,
			"X_BROADCOM_COM_InternalPortEnd": 7170,
			"PortMappingProtocol": "UDP"
		}]
	},{
		"PortMappingDescription": "RTP Remote Transfer Protocol",
		"PortRange": [{
			"ExternalPort": 1634,
			"X_BROADCOM_COM_ExternalPortEnd": 16482,
			"InternalPort": 1634,
			"X_BROADCOM_COM_InternalPortEnd": 16482,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "SFTP Secure File Transfer",
		"PortRange": [{
			"ExternalPort": 22,
			"X_BROADCOM_COM_ExternalPortEnd": 22,
			"InternalPort": 22,
			"X_BROADCOM_COM_InternalPortEnd": 22,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 115,
			"X_BROADCOM_COM_ExternalPortEnd": 115,
			"InternalPort": 115,
			"X_BROADCOM_COM_InternalPortEnd": 115,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "SIP Session Control",
		"PortRange": [{
			"ExternalPort": 5060,
			"X_BROADCOM_COM_ExternalPortEnd": 5060,
			"InternalPort": 5060,
			"X_BROADCOM_COM_InternalPortEnd": 5060,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 5063,
			"X_BROADCOM_COM_ExternalPortEnd": 5063,
			"InternalPort": 5063,
			"X_BROADCOM_COM_InternalPortEnd": 5063,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "SlingBox Media Service",
		"PortRange": [{
			"ExternalPort": 5001,
			"X_BROADCOM_COM_ExternalPortEnd": 5001,
			"InternalPort": 5001,
			"X_BROADCOM_COM_InternalPortEnd": 5001,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "SMTP Mail Service",
		"PortRange": [{
			"ExternalPort": 25,
			"X_BROADCOM_COM_ExternalPortEnd": 25,
			"InternalPort": 25,
			"X_BROADCOM_COM_InternalPortEnd": 25,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "SQL Database Management",
		"PortRange": [{
			"ExternalPort": 1433,
			"X_BROADCOM_COM_ExternalPortEnd": 1433,
			"InternalPort": 1433,
			"X_BROADCOM_COM_InternalPortEnd": 1433,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "SSH Secure Remote Management",
		"PortRange": [{
			"ExternalPort": 22,
			"X_BROADCOM_COM_ExternalPortEnd": 22,
			"InternalPort": 22,
			"X_BROADCOM_COM_InternalPortEnd": 22,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "T120 Conferencing Service",
		"PortRange": [{
			"ExternalPort": 1503,
			"X_BROADCOM_COM_ExternalPortEnd": 1503,
			"InternalPort": 1503,
			"X_BROADCOM_COM_InternalPortEnd": 1503,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "Telnet Remote Management",
		"PortRange": [{
			"ExternalPort": 23,
			"X_BROADCOM_COM_ExternalPortEnd": 23,
			"InternalPort": 23,
			"X_BROADCOM_COM_InternalPortEnd": 23,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "VNC Remote Management",
		"PortRange": [{
			"ExternalPort": 5500,
			"X_BROADCOM_COM_ExternalPortEnd": 5500,
			"InternalPort": 5500,
			"X_BROADCOM_COM_InternalPortEnd": 5500,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 5800,
			"X_BROADCOM_COM_ExternalPortEnd": 5801,
			"InternalPort": 5800,
			"X_BROADCOM_COM_InternalPortEnd": 5801,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 5900,
			"X_BROADCOM_COM_ExternalPortEnd": 5901,
			"InternalPort": 5900,
			"X_BROADCOM_COM_InternalPortEnd": 5901,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "Windows Messaging",
		"PortRange": [{
			"ExternalPort": 1024,
			"X_BROADCOM_COM_ExternalPortEnd": 1030,
			"InternalPort": 1024,
			"X_BROADCOM_COM_InternalPortEnd": 1030,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "Windows Service",
		"PortRange": [{
			"ExternalPort": 135,
			"X_BROADCOM_COM_ExternalPortEnd": 139,
			"InternalPort": 135,
			"X_BROADCOM_COM_InternalPortEnd": 139,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 445,
			"X_BROADCOM_COM_ExternalPortEnd": 1434,
			"InternalPort": 445,
			"X_BROADCOM_COM_InternalPortEnd": 1434,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "XBox Game Console",
		"PortRange": [{
			"ExternalPort": 53,
			"X_BROADCOM_COM_ExternalPortEnd": 53,
			"InternalPort": 53,
			"X_BROADCOM_COM_InternalPortEnd": 53,
			"PortMappingProtocol": "TCP or UDP"
		},{
			"ExternalPort": 88,
			"X_BROADCOM_COM_ExternalPortEnd": 88,
			"InternalPort": 88,
			"X_BROADCOM_COM_InternalPortEnd": 88,
			"PortMappingProtocol": "UDP"
		},{
			"ExternalPort": 3074,
			"X_BROADCOM_COM_ExternalPortEnd": 3074,
			"InternalPort": 3074,
			"X_BROADCOM_COM_InternalPortEnd": 3074,
			"PortMappingProtocol": "TCP or UDP"
		},{
			"ExternalPort": 80,
			"X_BROADCOM_COM_ExternalPortEnd": 80,
			"InternalPort": 80,
			"X_BROADCOM_COM_InternalPortEnd": 80,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "XBox 360 #2 Game Console",
		"PortRange": [{
			"ExternalPort": 15980,
			"X_BROADCOM_COM_ExternalPortEnd": 15980,
			"InternalPort": 15980,
			"X_BROADCOM_COM_InternalPortEnd": 15980,
			"PortMappingProtocol": "TCP"
		}]
	},{
		"PortMappingDescription": "XBox 360 #3 Game Console",
		"PortRange": [{
			"ExternalPort": 24687,
			"X_BROADCOM_COM_ExternalPortEnd": 24687,
			"InternalPort": 24687,
			"X_BROADCOM_COM_InternalPortEnd": 24687,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "XBox 360 Kinect Game Console",
		"PortRange": [{
			"ExternalPort": 1863,
			"X_BROADCOM_COM_ExternalPortEnd": 1863,
			"InternalPort": 1863,
			"X_BROADCOM_COM_InternalPortEnd": 1863,
			"PortMappingProtocol": "TCP or UDP"
		}]
	},{
		"PortMappingDescription": "Yahoo Messenger with Client Directory Chat Service",
		"PortRange": [{
			"ExternalPort": 5000,
			"X_BROADCOM_COM_ExternalPortEnd": 5010,
			"InternalPort": 5000,
			"X_BROADCOM_COM_InternalPortEnd": 5010,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 5050,
			"X_BROADCOM_COM_ExternalPortEnd": 5050,
			"InternalPort": 5050,
			"X_BROADCOM_COM_InternalPortEnd": 5050,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 5100,
			"X_BROADCOM_COM_ExternalPortEnd": 5100,
			"InternalPort": 5100,
			"X_BROADCOM_COM_InternalPortEnd": 5100,
			"PortMappingProtocol": "TCP"
		},{
			"ExternalPort": 6600,
			"X_BROADCOM_COM_ExternalPortEnd": 6699,
			"InternalPort": 6600,
			"X_BROADCOM_COM_InternalPortEnd": 6699,
			"PortMappingProtocol": "TCP"
		}]
	}];

Apps.remove({});
for (var i = 0; i < initApps.length; i++) {
	Apps.insert(initApps[i]);
}

/*
Meteor.publish('sxacc-port-mapping-apps', function(orgId) {

	var apps = Apps.find({
		//orgId: orgId
	});
	return apps;
});
*/
var updatePortMapping = function(orgId, cpeId, path, instance, valueobj) {

	var prefix = path + "." + instance + ".";

	var setValue = {};

	_.each(valueobj, function(val_, key_) {
		setValue[prefix + key_] = val_;
	});

	var setobj = {
		"operation": "SetParameterValues",
		"cpeIdentifier": {
			"serialNumber": cpeId
		},
		"parameterValues": setValue,
		"execPolicy": {
			"timeout": 10
		}
	};

	var result = AcsNbi.deviceOp(orgId, setobj);

	var results = [];
	results.push({index:instance,obj:valueobj});
	return results;
};


var addSetPortMapping = function(orgId, cpeId, path, valueobj) {
	
	var results = [];

	var addObj = {
		"operation": "AddObject",
		"cpeIdentifier": {
			"serialNumber": cpeId
		},
		"objectName": path + ".",
		"execPolicy": {
			"timeout": 10
		}
	};

	var result = AcsNbi.deviceOp(orgId, addObj);

	var instance_num = result.data.newObjectIndex;

	updatePortMapping(orgId, cpeId, path, instance_num, valueobj);

	results.push({
		index: instance_num,
		obj: valueobj
	});
	return results;
};

Meteor.methods({
	
	portMappingApps: function(orgId) {
		var apps = Apps.find({
		//orgId: orgId
		}).fetch();
		return apps;
	},

	lanHostGet: function(orgId, cpeId) {
		var paramNames = [];
		var path = 'InternetGatewayDevice.LANDevice.1.Hosts.Host';
		paramNames.push(path + ".");
		var result = AcsNbi.getParameterValues.call(this, orgId, cpeId, true, paramNames);
		var hosts = Utils.getValueByPath(result.data,path);
		return {path:path,hosts:hosts};
	},

	portMappingGet: function(orgId,cpeId) {
		var aliasPath = "X_CALIX_SXACC_DefaultWanConnectionPath.PortMapping.";
		var paramNames = [aliasPath];
		var result = AcsNbi.getParameterValues.call(this, orgId, cpeId, true, paramNames);
		var wanPathPattern = /InternetGatewayDevice\.WANDevice\.(\d+)\.WANConnectionDevice\.(\d+)\.(WANIPConnection|WANPPPConnection)\.(\d+)/;
		var wanConnectionPath = wanPathPattern.exec(result.data[aliasPath])[0];
		var mappingPath = wanConnectionPath+".PortMapping";
		var mappings = Utils.getValueByPath(result.data,mappingPath);
		return {path:mappingPath,mappings:mappings};
	},

	portMappingUpdate: updatePortMapping,

	portMappingAdd: function(orgId,cpeId,path,valueobj){

		if(valueobj._id){
			valueobj = _.omit(valueobj,'_id','orgId');
		}

		var valueobj_ = valueobj;
		var results = [];

		_.each(valueobj.PortRange, function(range) {
			valueobj_ = _.pick(valueobj, 'PortMappingEnabled', 'PortMappingDescription', 'InternalClient');
			valueobj_ = _.extend(valueobj_, range);
			var tmp = [];
			/*
			if(valueobj_.PortMappingProtocol === 'TCP/UDP'){
				var valueobj_tcp = _.clone(valueobj_);
				valueobj_tcp.PortMappingProtocol = 'TCP';
				tmp = addSetPortMapping(orgId,cpeId,path,valueobj_tcp);
				results = results.concat(tmp);
				var valueobj_udp = _.clone(valueobj_);
				valueobj_udp.PortMappingProtocol = 'UDP';
				tmp = addSetPortMapping(orgId,cpeId,path,valueobj_udp);
				results = results.concat(tmp);
			}else{
				tmp = addSetPortMapping(orgId,cpeId,path,valueobj_);
				results = results.concat(tmp);
			}*/
			tmp = addSetPortMapping(orgId,cpeId,path,valueobj_);
			results = results.concat(tmp);
		})

		return results;

	},

	portMappingDel: function(orgId,cpeId,path,instances) {
		var result;
		var instanceArray = instances.split(",");
		_.each(instanceArray,function(instance){
			var delObj = {
				"operation": "DeleteObject",
				"cpeIdentifier": {
					"serialNumber": cpeId
				},
				"objectName": path + "." + instance + "."
			};

			result = AcsNbi.deviceOp(orgId, delObj);
		});
		return result;
	}
	
});
AcsNbi = AcsNbi || {};

var _nbiPref, _cpeUrl, _apiUrl;


var config = {};

var nbiPrefix = function() {
  if (_nbiPref) return _nbiPref;

  var nbiScheme = 'http',
    //config = sxa.systemUtil.fetchConfig(),

    nbiUrl = config['sxacc.InternalAcsApiUrl'],
    nbiHost = process.env.SXACC_ACS_API_HOST || 'localhost',
    nbiPort = process.env.SXACC_ACS_API_PORT || 8081;

  nbiUrl = nbiUrl || nbiScheme + '://' + nbiHost + ':' + nbiPort;

  //Logger.debug('ACS Server Url : ' + nbiUrl);
  _nbiPref = nbiUrl + '/';
  return _nbiPref;
};

var apiURL = function() {
  if (_apiUrl) return _apiUrl;


  //var config = sxa.systemUtil.fetchConfig();

  _apiUrl = config['sxacc.ExternalAcsNbiApiUrl'];
  return _apiUrl;
}

var cpePrefix = function() {
  if (_cpeUrl) return _cpeUrl;

  //var config = sxa.systemUtil.fetchConfig();

  _cpeUrl = config['sxacc.CpeAcsUrl'];
  return _cpeUrl
};

var mkNbiUrl = function(path) {
  return nbiPrefix() + path;
};

var deviceOpPath = 'cc/device-op';
var devicePath = 'cc/device';
var filePath = 'cc/file';
var workflowPath = "cc/workflow";
var profilePath = "cc/configuration-profile";
var categoryPath = "cc/configuration-category";
var deviceCWMPLogPath = "cc/device-cwmp-logs";
var subscriberPath = "cc/subscriber";
var servicePlanPath = "cc/service-plan";



var getNbiUrl = function(orgId, apiPath) {
  return nbiPrefix() + apiPath + '?orgId=' + orgId;
};

// Use _.extend to add more header options
var nbiHeaders = {
  'Content-Type': 'application/json'
};

/** Local utility functions
 */

var unblock = function(context) {
  if (context && context.unblock) context.unblock();
  else Logger.warn('No unblock api in context');
};

var buildCallback = function(asyncCallback) {
  if (asyncCallback == null) return null;

  return function(error, data) {
    var err = buildMeteorError(error);
    asyncCallback(err, data);
  };
};

var isMeteorError = function(error) {
  if (error != null) {
    if (error.errorType === 'Meteor.Error' ||
      (_.isString(error.error) && _.isString(error.reason) && _.isString(error.details))) {
      return true;
    }
  }

  return false;
};

var getErrorReason = function(code) {
  if ('ENOTFOUND' == code) return 'Cannot find the ACS Server';
  else if ('ECONNREFUSED' == code) return 'Connection refused by ACS Server';

  return code;
};

var buildMeteorError = function(error) {
  var err, reason, details, respData

  if (error == null) return error;
  if (isMeteorError(error)) return error;

  respData = error && error.response && error.response.data;
  if (respData && respData.error) {
    // use 'error' in body if it's there
    err = error.response.statusCode;
    reason = respData.error;
    details = JSON.stringify(respData.error);
  } else if (respData) {
    // fallback to data content
    err = error.response.statusCode;
    reason = respData;
    details = JSON.stringify(respData);
  } else if (error.code) {
    err = error.errno + ' - ' + error.code;
    reason = getErrorReason(error.code);
    details = error.message;
  } else {
    err = error.errno || 'UNKNOWN';
    reason = JSON.stringify(error);
    details = reason;
  }

  return new Meteor.Error(err, reason, details);
};

/** Device operation wrapper.
 */

var deviceOp = AcsNbi.deviceOp = function(orgId, reqData, asyncCallback) {
  var deviceOpUrl = getNbiUrl(orgId, deviceOpPath),
    callback, httpOptions;

  // orgId
  check(orgId, String);
  // opName, opId, cpeId, execPolicy, getOption
  check(reqData, {
    operation: String,
    cpeIdentifier: Match.Optional(Match.ObjectIncluding({
      serialNumber: String
    })),
    cpeFilter: Match.Optional(Object),
    execPolicy: Match.Optional(Object), // TODO

    correlationId: Match.Optional(String),
    callbackUrl: Match.Optional(String),

    // Get
    parameterNames: Match.Optional([String]),
    getOptions: Match.Optional(Match.OneOf(Match.ObjectIncluding({
      cachedData: Boolean
    }), Match.ObjectIncluding({
      liveData: Boolean
    }))),

    // Set
    parameterValues: Match.Optional(Object),

    // Diag
    diagType: Match.Optional(String),
    diagParameters: Match.Optional(Object),

    // Add & Delete
    objectName: Match.Optional(String),

    // Upload & Download
    fileType: Match.Optional(String),
    csrUsername: Match.Optional(String),
    internalFileId: Match.Optional(String),
    description: Match.Optional(String)
  });

  if (reqData.correlationId == null) {
    reqData.correlationId = (new Meteor.Collection.ObjectID()).toHexString();
  }

  httpOptions = {
    headers: nbiHeaders,
    data: reqData
  };
  callback = buildCallback(asyncCallback);

  if (callback != null) {
    HTTP.post(deviceOpUrl, httpOptions, callback);
  } else {
    try {
      return HTTP.post(deviceOpUrl, httpOptions);
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

/******************************** ACS APIs *******************************/
/*
 * Comprehensive method for retrieving data using all parameters.
 * If the wantLiveData argument is true, data is retrieved from the device;
 * use wantLiveData for retrieving data only from MongoDB.
 * See ACS API specs at http://wiki.calix.local/display/Compass/SXA-CC+ACS+API
 */

AcsNbi.retrieveData = function(orgId, cpeId, wantLiveData, wantCachedData, parameterNames, asyncCallback) {
  var options = {};

  if (typeof(wantLiveData) === "boolean") {
    options.liveData = wantLiveData;
  }

  if (typeof(wantCachedData) === "boolean") {
    options.cachedData = wantCachedData;
  }

  var reqData = {
    operation: 'GetParameterValues',
    cpeIdentifier: cpeId,
    getOptions: options,
    parameterNames: parameterNames
  };

  if (asyncCallback != null) {
    deviceOp(orgId, reqData, asyncCallback);
  } else {
    unblock(this);
    return deviceOp(orgId, reqData);
  }
};

//Deprecated: use retrieveData instead; eventually we should remove this
AcsNbi.getParameterValues = function(orgId, cpeId, liveData, parameterNames, asyncCallback) {
  var reqData = {
    operation: 'GetParameterValues',
    cpeIdentifier: cpeId,
    getOptions: {
      liveData: liveData
    },
    parameterNames: parameterNames
  };

  if (asyncCallback != null) deviceOp(orgId, reqData, asyncCallback);
  else {
    // Unblock as GetParameter is immutable
    unblock(this);
    return deviceOp(orgId, reqData);
  }
};

/**
 * This blocks the Meteor.Method's fiber if it's called in sync from method.
 */
AcsNbi.setParameterValues = function(orgId, cpeId, parameterValues, asyncCallback) {
  var reqData = {
    operation: 'SetParameterValues',
    cpeIdentifier: cpeId,
    parameterValues: parameterValues
  };

  if (asyncCallback != null) deviceOp(orgId, reqData, asyncCallback);
  else return deviceOp(orgId, reqData);
};

AcsNbi.reboot = function(orgId, cpeId, asyncCallback) {
  var reqData = {
    operation: 'Reboot',
    cpeIdentifier: cpeId,
    "execPolicy": {
      "timeout": 300
    }
  };

  if (asyncCallback != null) deviceOp(orgId, reqData, asyncCallback);
  else {
    // Unblock as reboot takes long time
    unblock(this);
    return deviceOp(orgId, reqData);
  }
};

AcsNbi.factoryReset = function(orgId, cpeId, asyncCallback) {
  var reqData = {
    operation: 'FactoryReset',
    cpeIdentifier: cpeId,
    "execPolicy": {
      "timeout": 300
    }
  };

  if (asyncCallback != null) deviceOp(orgId, reqData, asyncCallback);
  else {
    // Unblock as factory-reset takes long time
    unblock(this);
    return deviceOp(orgId, reqData);
  }
};

AcsNbi.getDeviceInfo = function(orgId, serialNumber, asyncCallback) {
  var deviceUrl = getNbiUrl(orgId, devicePath);
  var options = {
    headers: nbiHeaders,
    data: {
      'serialNumber': serialNumber
    }
  };
  var cb = buildCallback(asyncCallback);

  if (cb != null) HTTP.get(deviceUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(deviceUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};


AcsNbi.getDeviceInfoByInternalDeviceId = function(internalDeviceId, asyncCallback) {
  var deviceUrl = nbiPrefix() + devicePath + '/' + internalDeviceId;
  var options = {
    headers: nbiHeaders
  };
  var cb = buildCallback(asyncCallback);

  if (cb != null) HTTP.get(deviceUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(deviceUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getDeviceInfoByRegId = function(regId, asyncCallback) {
  var deviceUrl = nbiPrefix() + devicePath;
  var options = {
    headers: nbiHeaders,
    data: {
      "registrationId": regId
    }
  };
  var cb = buildCallback(asyncCallback);

  if (cb != null) HTTP.get(deviceUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(deviceUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};


AcsNbi.deleteCpe = function(orgId, serialNumber, asyncCallback) {
  var cpeUrl = getNbiUrl(orgId, devicePath) + "&serialNumber=" + serialNumber;

  var options = {
    headers: nbiHeaders
  };

  var cb = buildCallback(asyncCallback);
  if (cb != null) {
    HTTP.del(cpeUrl, options, cb);
  } else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.del(cpeUrl, options);
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};


AcsNbi.getFiles = function(orgId, cpeId, type, asyncCallback) {
  var fileUrl = getNbiUrl(orgId, filePath);
  var options = {
    headers: nbiHeaders,
    data: {
      'orgId': orgId,
      'cpeIdentifier': cpeId,
      'type': type
    }
  };
  var cb = buildCallback(asyncCallback);

  if (cb != null) HTTP.get(fileUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(fileUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getWorkflowSummary = function(orgId, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var options = {
    headers: nbiHeaders
  };
  var workflowUrl = getNbiUrl(orgId, workflowPath) + '&brief=true';

  if (cb != null) HTTP.get(workflowUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(workflowUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getWorkflowExeLogsCount = function(workflowId, state, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var workflowExeLogsCountPath = "cc/workflow-exec-logs/count";

  var workflowUrl = nbiPrefix() + workflowExeLogsCountPath;

  var options = {
    headers: nbiHeaders,
    data: {
      "workflowId": workflowId
    }
  };
  if (state != null) {
    options.data['state'] = state;
  }

  if (cb != null) HTTP.get(workflowUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(workflowUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getWorkflowExeLogs = function(workflowId, pageNumber, pageLength, state, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var workflowExeLogsPath = "cc/workflow-exec-logs";

  var workflowUrl = nbiPrefix() + workflowExeLogsPath + '?' + 'skip=' + (pageNumber - 1) * pageLength + '&limit=' + pageLength;

  var options = {
    headers: nbiHeaders,
    data: {
      "workflowId": workflowId
    }
  };
  if (state != null) {
    options.data['state'] = state;
  }

  if (cb != null) HTTP.get(workflowUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(workflowUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.deleteWorkflow = function(workflowId, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var workflowUrl = nbiPrefix() + workflowPath + '/' + workflowId;

  var options = {
    headers: nbiHeaders
  };

  if (cb != null) HTTP.del(workflowUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.del(workflowUrl, options);
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.suspendWorkflow = function(workflowId, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var workflowUrl = nbiPrefix() + workflowPath + '/' + workflowId + '/suspend';

  var options = {
    headers: nbiHeaders
  };

  if (cb != null) HTTP.put(workflowUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.put(workflowUrl, options);
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.resumeWorkflow = function(workflowId, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var workflowUrl = nbiPrefix() + workflowPath + '/' + workflowId + '/resume';

  var options = {
    headers: nbiHeaders,
  };

  if (cb != null) HTTP.put(workflowUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.put(workflowUrl, options);
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getWorkflowById = function(workflowId, orgId, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var workflowUrl = nbiPrefix() + workflowPath + '/' + workflowId + '?orgId=' + orgId;

  var options = {
    headers: nbiHeaders,
  };

  if (cb != null) HTTP.get(workflowUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(workflowUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getProfileSummary = function(orgId, asyncCallback) {
  var cb = buildCallback(asyncCallback);

  var options = {
    headers: nbiHeaders
  };
  var profileUrl = getNbiUrl(orgId, profilePath) + '&brief=true';

  if (cb != null) HTTP.get(profileUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(profileUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getProfileSummaryById = function(orgId, profileId, asyncCallback) {
  var cb = buildCallback(asyncCallback);

  var options = {
    headers: nbiHeaders
  };
  var profileUrl = nbiPrefix() + profilePath + '/' + profileId + '?orgId=' + orgId;

  if (cb != null) HTTP.get(profileUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(profileUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.deleteProfile = function(orgId, profileId, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var profileUrl = getNbiUrl(orgId, profilePath);

  var options = {
    headers: nbiHeaders,
    data: {
      "_id": profileId
    }

  };

  if (cb != null) HTTP.del(profileUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.del(profileUrl, options);
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.createProfile = function(orgId, profile, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var profileUrl = getNbiUrl(orgId, profilePath);

  var options = {
    headers: nbiHeaders,
    data: profile
  };

  if (cb != null) HTTP.post(profileUrl, options, cb).data;
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.post(profileUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getDeviceCWMPLogCount = function(orgId, cpeId, asyncCallback) {
  var cb = buildCallback(asyncCallback);

  var deviceCWMPLogUrl = nbiPrefix() + deviceCWMPLogPath + "/count";

  var options = {
    headers: nbiHeaders,
    data: {
      "orgId": orgId,
      "cpeIdentifier": cpeId
    }
  };

  if (cb != null) HTTP.get(deviceCWMPLogUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(deviceCWMPLogUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getDeviceCWMPLogStatus = function(orgId, cpeId, pageNumber, pageLength, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var deviceCWMPLogUrl = nbiPrefix() + deviceCWMPLogPath + '?' + 'skip=' + (pageNumber - 1) * pageLength + '&limit=' + pageLength;

  var options = {
    headers: nbiHeaders,
    data: {
      "orgId": orgId,
      "cpeIdentifier": cpeId
    }
  };

  if (cb != null) HTTP.get(deviceCWMPLogUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(deviceCWMPLogUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getDeviceEventCount = function(orgId, deviceSn, asyncCallback) {
  var cb = buildCallback(asyncCallback);

  var deviceEventUrl = nbiPrefix() + deviceEventPath + "/count";

  var options = {
    headers: nbiHeaders,
    data: {
      "orgId": orgId,
      "deviceSn": deviceSn
    }
  };

  if (cb != null) HTTP.get(deviceEventUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(deviceEventUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getDeviceEventStatus = function(orgId, deviceSn, pageNumber, pageLength, order, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var deviceEventUrl = nbiPrefix() + deviceEventPath + '?' + 'skip=' + (pageNumber - 1) * pageLength + '&limit=' + pageLength;

  var options = {
    headers: nbiHeaders,
    data: {
      "orgId": orgId,
      "deviceSn": deviceSn
    }
  };

  if (order != null) {
    options['data']['$orderby'] = order;
  }

  if (cb != null) HTTP.get(deviceEventUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(deviceEventUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getCategory = function(asyncCallback) {
  var cb = buildCallback(asyncCallback);

  var options = {
    headers: nbiHeaders
  };
  var categoryUrl = nbiPrefix() + categoryPath;

  if (cb != null) HTTP.get(categoryUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(categoryUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.deleteNetOpFile = function(orgId, fileId, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var fileUrl = getNbiUrl(orgId, filePath);
  var options = {
    headers: nbiHeaders,
    data: {
      "_id": fileId
    }
  };

  if (cb != null) HTTP.del(fileUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.del(fileUrl, options);
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.createNetOpFile = function(orgId, fileObj, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var fileUrl = getNbiUrl(orgId, filePath);
  var options = {
    headers: nbiHeaders,
    data: fileObj
  };

  if (cb != null) HTTP.post(fileUrl, options, cb).data;
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.post(fileUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getNetOpFileCountByType = function(orgId, type, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var fileUrl = nbiPrefix() + filePath + '/count';
  var options = {
    headers: nbiHeaders,
    data: {
      "orgId": orgId,
      "type": type
    }
  };

  if (cb != null) HTTP.get(fileUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(fileUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getNetOpFilesByType = function(orgId, type, pageNumber, pageLength, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var fileUrl = nbiPrefix() + filePath + '?' + 'skip=' + (pageNumber - 1) * pageLength + '&limit=' + pageLength;
  var options = {
    headers: nbiHeaders,
    data: {
      "orgId": orgId,
      "type": type
    }
  };

  if (cb != null) HTTP.get(fileUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(fileUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getNetOpFileByTypeAndName = function(orgId, type, name, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var fileUrl = getNbiUrl(orgId, filePath);
  var options = {
    headers: nbiHeaders,
    data: {
      "orgId": orgId,
      "type": type,
      "name": name
    }
  };

  if (cb != null) HTTP.get(fileUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(fileUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.updateNetOpFile = function(orgId, fileObj, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var fileUrl = getNbiUrl(orgId, filePath);
  var options = {
    headers: nbiHeaders,
    data: fileObj
  };

  if (cb != null) HTTP.put(fileUrl, options, cb).data;
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.put(fileUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.configBackup = function(orgId, cpeId, userName, description, asyncCallback) {
  var backupReq = {
    "operation": "Upload",
    "cpeIdentifier": cpeId,
    "fileType": "1 Vendor Configuration File",
    "csrUsername": userName,
    "description": description,
    "execPolicy": {
      "timeout": 300
    }
  };

  if (asyncCallback != null) deviceOp(orgId, backupReq, asyncCallback);
  else {
    // Unblock as Backup is long operation
    unblock(this);
    return deviceOp(orgId, backupReq);
  }
};

AcsNbi.configRestore = function(orgId, cpeId, fileId, asyncCallback) {
  var restoreReq = {
    "operation": "Download",
    "cpeIdentifier": cpeId,
    "fileType": "3 Vendor Configuration File",
    "internalFileId": fileId,
    "execPolicy": {
      "timeout": 300
    }
  };

  if (asyncCallback != null) deviceOp(orgId, restoreReq, asyncCallback);
  else {
    // Unblock as Backup is long operation
    unblock(this);
    return deviceOp(orgId, restoreReq);
  }
};

AcsNbi.ipping = function(orgId, cpeId, diagParameters, asyncCallback) {
  var pingReq = {
    "operation": "Diagnostics",
    "cpeIdentifier": cpeId,
    "execPolicy": {
      "timeout": 30
    },
    "diagType": "InternetGatewayDevice.IPPingDiagnostics",
    "diagParameters": diagParameters
  };

  if (asyncCallback != null) deviceOp(orgId, pingReq, asyncCallback);
  else {
    unblock(this);
    return deviceOp(orgId, pingReq);
  }
};

AcsNbi.traceroute = function(orgId, cpeId, diagParameters, asyncCallback) {
  var traceReq = {
    "operation": "Diagnostics",
    "cpeIdentifier": cpeId,
    "execPolicy": {
      "timeout": 150
    },
    "diagType": "InternetGatewayDevice.TraceRouteDiagnostics",
    "diagParameters": diagParameters
  };

  if (asyncCallback != null) deviceOp(orgId, traceReq, asyncCallback);
  else {
    unblock(this);
    return deviceOp(orgId, traceReq);
  }
};

/* ********************* subscriber ******************/

AcsNbi.addSubscriber = function(orgId, subscriber, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var subscriberUrl = getNbiUrl(orgId, subscriberPath);

  Logger.info("subscriberUrl: " + subscriberUrl);

  var options = {
    headers: nbiHeaders,
    data: subscriber
  };

  if (cb != null) {
    HTTP.post(subscriberUrl, options, cb).data;
  } else {
    unblock(this);
    try {
      return HTTP.post(subscriberUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.updateSubscriber = function(subscriberId, subscriber, asyncCallback) {
  var cb = buildCallback(asyncCallback);

  var subscriberUrl = nbiPrefix() + subscriberPath + '/' + subscriberId;

  var options = {
    headers: nbiHeaders,
    data: subscriber
  };

  if (cb != null) {
    HTTP.put(subscriberUrl, options, cb).data;
  } else {
    unblock(this);
    try {
      return HTTP.put(subscriberUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};


AcsNbi.getSubscriberSummaryById = function(orgId, subscriberId, asyncCallback) {
  var cb = buildCallback(asyncCallback);

  var options = {
    headers: nbiHeaders
  };
  var subscriberUrl = nbiPrefix() + subscriberPath + '/' + subscriberId + '?' + 'orgId=' + orgId;

  if (cb != null) HTTP.get(subscriberUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(subscriberUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.deleteSubscriber = function(subscriberId, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var subscriberUrl = nbiPrefix() + subscriberPath + '/' + subscriberId;

  var options = {
    headers: nbiHeaders
  };

  if (cb != null) {
    HTTP.del(subscriberUrl, options, cb);
  } else {
    unblock(this);
    try {
      return HTTP.del(subscriberUrl, options);
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};


/* ********************* service plan ******************/
AcsNbi.addServicePlan = function(orgId, servicePlan, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var servicePlanUrl = getNbiUrl(orgId, servicePlanPath);

  var options = {
    headers: nbiHeaders,
    data: servicePlan
  };

  if (cb != null) {
    HTTP.post(servicePlanUrl, options, cb).data;
  } else {
    unblock(this);
    try {
      return HTTP.post(servicePlanUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.updateServicePlan = function(orgId, servicePlanId, servicePlan, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var servicePlanUrl = nbiPrefix() + servicePlanPath + '/' + servicePlanId + '?' + 'orgId=' + orgId;

  var options = {
    headers: nbiHeaders,
    data: servicePlan
  };

  if (cb != null) {
    HTTP.put(servicePlanUrl, options, cb).data;
  } else {
    unblock(this);
    try {
      return HTTP.put(servicePlanUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.deleteServicePlan = function(servicePlanId, asyncCallback) {
  var cb = buildCallback(asyncCallback);
  var servicePlanUrl = nbiPrefix() + servicePlanPath + '/' + servicePlanId;

  var options = {
    headers: nbiHeaders
  };

  if (cb != null) {
    HTTP.del(servicePlanUrl, options, cb);
  } else {
    unblock(this);
    try {
      return HTTP.del(servicePlanUrl, options);
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};

AcsNbi.getServicePlanBySubscriberId = function(orgId, subscriberId, asyncCallback) {
  var cb = buildCallback(asyncCallback);

  var options = {
    headers: nbiHeaders
  };
  var servicePlanUrl = nbiPrefix() + servicePlanPath + '?' + 'orgId=' + orgId + '&' + 'subscriberId=' + subscriberId;

  if (cb != null) HTTP.get(servicePlanUrl, options, cb);
  else {
    // Unblock as it's immutable
    unblock(this);
    try {
      return HTTP.get(servicePlanUrl, options).data;
    } catch (error) {
      throw buildMeteorError(error);
    }
  }
};


AcsNbi.buildMeteorError = buildMeteorError;

AcsNbi.nbiPrefix = nbiPrefix;
AcsNbi.nbiURL = mkNbiUrl;
AcsNbi.apiURL = apiURL;
AcsNbi.cpePrefix = cpePrefix;

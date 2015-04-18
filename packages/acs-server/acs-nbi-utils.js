AcsNbi = AcsNbi || {};

// -------- Utilities --------
AcsNbi.Utils = AcsNbi.Utils || {};

AcsNbi.Utils.getWanConnectionPath = function(orgId, cpeId, cb) {
  var result, defaultWanConnParam = "InternetGatewayDevice.Layer3Forwarding.DefaultConnectionService",
    connRequestUrlParam = "InternetGatewayDevice.ManagementServer.ConnectionRequestURL",
    wanDeviceParam = "InternetGatewayDevice.WANDevice.";

  // Parse function
  var parseWanConnectionPath = function(data) {
    var wanDevices, pattern, match, wanConnectionPath, found = false,
      detectWanConnection, connRequestUrl, wanDeviceIndex, wanConnectionDeviceIndex, wanXyConnectionName,
      wanXyConnectionIndex;

    wanDevices = Utils.getValueByPath(data, wanDeviceParam);

    wanConnectionPath = Utils.getValueByPath(data, defaultWanConnParam);
    if (_.isString(wanConnectionPath) && wanConnectionPath.length > 0) {
      pattern =
        /^InternetGatewayDevice\.WANDevice\.(\d+)\.WANConnectionDevice\.(\d+)\.(WANIPConnection|WANPPPConnection)\.(\d+)$/;
      match = pattern.exec(wanConnectionPath);
      if (match != null) {
        return wanConnectionPath;
      } // match
    }

    // Detect WAN by check connection
    detectWanConnection = function(wanDevices, connCheck) {
      return _.some(wanDevices, function(wanDevice, index) {
        if (wanDevice == null) return false;

        wanDeviceIndex = index;
        return _.some(wanDevice.WANConnectionDevice, function(connDevice, index) {
          var conn;
          if (connDevice == null) return false;

          wanConnectionDeviceIndex = index;
          conn = _.find(connDevice.WANIPConnection, connCheck);

          if (conn != null) {
            wanXyConnectionName = 'WANIPConnection';
            return true;
          }
          conn = _.find(connDevice.WANPPPConnection, connCheck);
          if (conn != null) {
            wanXyConnectionName = 'WANPPPConnection';
            return true;
          }

          return false;
        });
      });
    };

    // Try matching the Connection URL HOST/IP
    connRequestUrl = Utils.getValueByPath(data, connRequestUrlParam);
    if (_.isString(connRequestUrl) && connRequestUrl.length > 0) {
      pattern = /(?:[^:]*):\/\/([^:]*):(?:\d*).*/;
      match = pattern.exec(connRequestUrl);
      if (match != null) {
        found = detectWanConnection(wanDevices, function(conn, index) {
          wanXyConnectionIndex = index;
          if (match[1] == conn.ExternalIPAddress) return true;
          return false;
        });

        wanConnectionPath = 'InternetGatewayDevice.WANDevice.' + wanDeviceIndex + '.WANConnectionDevice.' +
          wanConnectionDeviceIndex + '.' + wanXyConnectionName + '.' + wanXyConnectionIndex;
      }
    }

    if (!found) {
      // Try the 'Connected' one
      found = detectWanConnection(wanDevices, function(conn, index) {
        wanXyConnectionIndex = index;
        if ('Connected' == conn.ConnectionStatus) return true;
        return false;
      });

      wanConnectionPath = 'InternetGatewayDevice.WANDevice.' + wanDeviceIndex + '.WANConnectionDevice.' +
        wanConnectionDeviceIndex + '.' + wanXyConnectionName + '.' + wanXyConnectionIndex;
    }

    if (found) return wanConnectionPath;

    return; // undefined
  };
  // END parseWanConnectionPath

  var callback = function(path) {
    Logger.info('WAN Connection Path is : ' + path);
    if (_.isFunction(cb)) cb(path);

    return path;
  };

  if (cb == null) {
    try {
      result = AcsNbi.getParameterValues(orgId, cpeId, /* live */ false, [
        defaultWanConnParam, connRequestUrlParam, wanDeviceParam
      ]);

      return callback(parseWanConnectionPath(result.data));
    } catch (error) {
      Logger.error('Error when retrieve cached WANDevice object : ' + JSON.stringify(error, null, 2));
      return; // undefined
    }
  }

  // Async Callback
  AcsNbi.getParameterValues(orgId, cpeId, /* live */ false, [
    defaultWanConnParam, connRequestUrlParam, wanDeviceParam
  ], function(error, result) {
    if (error) {
      Logger.error('Error when retrieve cached WANDevice object : ' + JSON.stringify(error, null, 2));
      callback();
      return;
    }

    callback(parseWanConnectionPath(result.data));
  });

};

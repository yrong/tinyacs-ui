var defaultWanPath = 'X_CALIX_SXACC_DefaultWanConnectionPath',
  getParamReference = function(wanPath) {
    return wanPath + '.Enable';
  },
  paramReferenceExp = /^(.*)\.Enable$/,
  getParamCommon = function(wanPath) {
    return [
      getParamReference(wanPath),
      wanPath + '.Uptime',
      wanPath + '.ConnectionStatus',
      wanPath + '.MACAddress',
      wanPath + '.ConnectionType',
      wanPath + '.DNSServers',
      wanPath + '.ExternalIPAddress',
      wanPath + '.Stats.EthernetBytesReceived',
      wanPath + '.Stats.EthernetBytesSent',
      wanPath + '.Stats.EthernetPacketsReceived',
      wanPath + '.Stats.EthernetPacketsSent',
      wanPath + '.ShapingRate',
      wanPath + '.X_000631_DsShapingRate'
    ]
  },
  getParamVlan = function(wanPath) {
    return [
      wanPath + '.X_000631_VlanMuxID',
      wanPath + '.X_000631_VlanMux8021p'
    ]
  },
  getParamIpConn = function(wanPath) {
    return [
      wanPath + '.AddressingType',
      wanPath + '.SubnetMask',
      wanPath + '.DefaultGateway'
    ];
  },
  getParamPppConn = function(wanPath) {
    return [
      wanPath + '.Username',
      wanPath + '.RemoteIPAddress'
    ];
  },
  getParamLive = function(wanPath) {
    return [
      wanPath + '.Uptime',
      wanPath + '.Stats.EthernetBytesReceived',
      wanPath + '.Stats.EthernetBytesSent',
      wanPath + '.Stats.EthernetPacketsReceived',
      wanPath + '.Stats.EthernetPacketsSent'
    ];
  };

Meteor.methods({
  'getWanInterfaces': function(orgId, serialNumber) {
    var cpeId = Utils.buildCpeId(serialNumber);
    var pathAvailableIf = 'InternetGatewayDevice.Layer2Bridging.AvailableInterface.',
      result, wanIfArray, wanIfNameArray;

    if (!_.isString(serialNumber) || serialNumber.trim().length == 0) {
      throw new Meteor.Error(400, 'Invalid cpeId or serialNumber');
    }

    result = AcsNbi.getParameterValues.call(this, orgId, cpeId, true, [pathAvailableIf]).data;
    result = Utils.getValueByPath(result, pathAvailableIf);

    wanIfArray = _.filter(result, function(v) {
      return v.InterfaceType == 'WANInterface' || v.InterfaceType == 'WANRouterConnection';
    });

    if (wanIfArray == null || wanIfArray.length == 0) {
      throw new Meteor.Error('no-wan-interface', 'Cannot find any WAN Interface on CPE ' + serialNumber,
        'None of the interfaces under InternetGatewayDevice.Layer2Bridging.AvailableInterface. are of type WANInterface or WANRouterConnection.');
    }

    wanIfArray = _.map(wanIfArray, function(v) {
      return v.InterfaceReference;
    });
    wanIfNameArray = _.map(wanIfArray, function(wanIf) {
      return wanIf + '.Name';
    });

    result = AcsNbi.getParameterValues.call(this, orgId, cpeId, /*live*/ true, wanIfNameArray).data;

    return _.map(wanIfArray, function(wanIf, i) {
      var name = Utils.getValueByPath(result, wanIfNameArray[i]);
      return {
        Name: name,
        _WanIf: wanIf
      }
    });
  },

  'getWanSummaries': function(orgId, serialNumber, wanIfArray) {
    if (!_.isString(serialNumber) || serialNumber.trim().length == 0) {
      throw new Meteor.Error(400, 'Invalid cpeId or serialNumber');
    }

    if (!_.isArray(wanIfArray) || wanIfArray.length == 0) {
      return [];
    }

    var cpeId = Utils.buildCpeId(serialNumber),
      paramNames = [],
      modelName,
      downstreamPath, upstreamPath,
      layer1UpstreamRate, layer1DownstreamRate,
      result;

    result = AcsNbi.getDeviceInfo.call(this, orgId, serialNumber);
    if (result.modelName != null) {
      modelName =  result.modelName.toUpperCase().substr(0, 4);
    }

    downstreamPath = wanIfArray[0]._WanIf.replace(/WANConnectionDevice.*/, 'WANCommonInterfaceConfig.Layer1DownstreamMaxBitRate');
    upstreamPath = wanIfArray[0]._WanIf.replace(/WANConnectionDevice.*/, 'WANCommonInterfaceConfig.Layer1UpstreamMaxBitRate');

    result = AcsNbi.getParameterValues.call(this, orgId, cpeId, /*live*/ true, [downstreamPath, upstreamPath]).data;
    layer1UpstreamRate = Utils.getValueByPath(result, upstreamPath),
    layer1DownstreamRate = Utils.getValueByPath(result, downstreamPath),

    _.each(wanIfArray, function(v) {
      var wanIf = v._WanIf;

      // Common
      Array.prototype.push.apply(paramNames, getParamCommon(wanIf));
      // Connection
      if (wanIf.indexOf('WANIPConnection') > 0) {
        Array.prototype.push.apply(paramNames, getParamIpConn(wanIf));
      } else if (wanIf.indexOf('WANPPPConnection') > 0) {
        Array.prototype.push.apply(paramNames, getParamPppConn(wanIf));
      }
      // Vlan
      if (modelName != null && modelName == '844E') {
        Array.prototype.push.apply(paramNames, getParamVlan(wanIf));
      }
      // Live
      Array.prototype.push.apply(paramNames, getParamLive(wanIf));
    });

    result = AcsNbi.getParameterValues.call(this, orgId, cpeId, /*live*/ true, paramNames).data;

    return _.map(wanIfArray, function(v) {
      var upstreamRate, upstreamShapingRate, downstreamRate, downstreamShapingRate;
      var vlanId, vlanPriority, vlanTagAction;

      var value = Utils.getValueByPath(result, v._WanIf);

      upstreamShapingRate = value['ShapingRate'];
      downstreamShapingRate = value['X_000631_DsShapingRate'];

      // Get 'UpstreamRate'
      if (upstreamShapingRate != null) {
        if (upstreamShapingRate == -1) {
          upstreamRate = layer1UpstreamRate;
        } else if (upstreamShapingRate <= 100) {
          upstreamRate = upstreamShapingRate * layer1UpstreamRate / 100;
        } else {
          upstreamRate = upstreamShapingRate;
        }
      }
      if (upstreamRate != null) {
        value['_UpstreamRate'] = upstreamRate / 1000000;
      }
      // Get 'DownstreamRate'
      if (downstreamShapingRate != null) {
        if (downstreamShapingRate == -1) {
          downstreamRate = layer1DownstreamRate;
        } else if (downstreamShapingRate <= 100) {
          downstreamRate = downstreamShapingRate * layer1DownstreamRate / 100;
        } else {
          downstreamRate = downstreamShapingRate;
        }
      }
      if (downstreamRate != null) {
        value['_DownstreamRate'] = downstreamRate / 1000000;
      }

      // VLAN parameters
      vlanId = value['X_000631_VlanMuxID'];
      vlanPriority = value['X_000631_VlanMux8021p'];

      if (vlanId != null && vlanPriority != null) {
        value['_VlanTagAction'] = (vlanId != '-1' || vlanPriority != '-1');
        value['_VlanId'] = vlanId;
        value['_VlanPriority'] = vlanPriority;
      }

      return _.extend(v, value);
    });
  },

  'getDefaultWanSummary': function(orgId, serialNumber) {
    var paramNames, wanPath = defaultWanPath;
    var result, value, downstreamPath, upstreamPath, parsedWanPath, match;
    var cpeId = Utils.buildCpeId(serialNumber);

    if (!_.isString(serialNumber) || serialNumber.trim().length == 0) {
      throw new Meteor.Error(400, 'Invalid cpeId or serialNumber');
    }

    var paramReference = getParamReference(defaultWanPath);

    // - Common Parameters
    paramNames = getParamCommon(defaultWanPath);
    value = AcsNbi.getParameterValues.call(this, orgId, cpeId, /*live*/ true, paramNames).data;
    if (value != null) {
      for (var key in value) {
        if (key.indexOf(paramReference) == 0) {
          // Use translated reference
          match = paramReferenceExp.exec(value[key]);
          if (match != null) {
            parsedWanPath = match[1];
          }
          break;
        }
      }
      if (parsedWanPath != null) {
        wanPath = parsedWanPath;
        downstreamPath = parsedWanPath.replace(/WANConnectionDevice.*/, 'WANCommonInterfaceConfig.Layer1DownstreamMaxBitRate');
        upstreamPath = parsedWanPath.replace(/WANConnectionDevice.*/, 'WANCommonInterfaceConfig.Layer1UpstreamMaxBitRate');
      } else {
        Logger.warn('wan-summary >> Empty parsed WAN Connection Path');
      }

      result = Utils.getValueByPath(value, wanPath);
    }

    // - WANIPConnection | WANPPPConnection
    Logger.info('wan-summary >> wan connection path : ' + wanPath);
    if (wanPath.indexOf('WANIPConnection') > 0) {
      paramNames = getParamIpConn(wanPath);
    } else if (wanPath.indexOf('WANPPPConnection') > 0) {
      paramNames = getParamPppConn(wanPath);
    } else {
      // Should never be here.
      paramNames = [];
    }
    paramNames.concat(getParamLive(wanPath)); // Live Values

    if (downstreamPath) paramNames.push(downstreamPath);
    if (upstreamPath) paramNames.push(upstreamPath);

    value = AcsNbi.getParameterValues.call(this, orgId, cpeId, /*live*/ true, paramNames).data;
    result = _.extend(result, Utils.getValueByPath(value, wanPath));

    // - Calculate Upstream/Downstream Rate
    var layer1UpstreamRate = Utils.getValueByPath(value, upstreamPath),
      layer1DownstreamRate = Utils.getValueByPath(value, downstreamPath),
      upstreamShapingRate = result['ShapingRate'],
      downstreamShapingRate = result['X_000631_DsShapingRate'],
      upstreamRate, downstreamRate;

    if (upstreamShapingRate != null) {
      if (upstreamShapingRate == -1) {
        upstreamRate = layer1UpstreamRate;
      } else if (upstreamShapingRate <= 100) {
        if (layer1UpstreamRate != null) {
          upstreamRate = upstreamShapingRate * layer1UpstreamRate / 100;
        }
      } else {
        upstreamRate = upstreamShapingRate;
      }
    }
    if (downstreamShapingRate != null) {
      if (downstreamShapingRate == -1) {
        downstreamRate = layer1DownstreamRate;
      } else if (downstreamShapingRate === "0") {
        downstreamRate = "Not Limited";
      } else if (downstreamShapingRate <= 100) {
        if (layer1DownstreamRate != null) {
          downstreamRate = downstreamShapingRate * layer1DownstreamRate / 100;
        }
      } else {
        downstreamRate = downstreamShapingRate;
      }
    }

    if (upstreamRate != null) result['UpstreamRate'] = upstreamRate / 1000000;

    if (downstreamRate != null) {
      if (downstreamRate !== "Not Limited") {
        result['DownstreamRate'] = downstreamRate / 1000000;
      } else {
        result['DownstreamRate'] = downstreamRate;
      }
    }

    var vlanId = result['X_000631_VlanMuxID'];
    var vlanPriority = result['X_000631_VlanMux8021p'];
    var vlanTagAction;
    if (vlanId != null && vlanPriority != null) {
      vlanTagAction = (vlanId != '-1' || vlanPriority != '-1');
    }
    result = _.extend(result, {
      VlanTagAction: vlanTagAction,
      VlanId: vlanId,
      VlanPriority: vlanPriority
    });

    return result;
  },

  'traceroute': function(orgId, serialNumber, diagParameters) {
    var result = AcsNbi.traceroute.call(this, orgId, Utils.buildCpeId(serialNumber), diagParameters);
    return Utils.getValueByPath(result.data, 'InternetGatewayDevice.TraceRouteDiagnostics');
  },

  'ipping': function(orgId, serialNumber, diagParameters) {
    var result = AcsNbi.ipping.call(this, orgId, Utils.buildCpeId(serialNumber), diagParameters);
    return Utils.getValueByPath(result.data, 'InternetGatewayDevice.IPPingDiagnostics');
  }
});

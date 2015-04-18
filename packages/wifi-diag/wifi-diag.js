var keyWifidiagRefreshFlag = 'wifidiag.refresh.flag';

Router.map(function() {
  this.route('troubleshooting-wifi-diag', {
    path: '/cpe/troubleshooting-wifi-diag',
    template: "wifidiag"
  });
});

// --------------------------------------------------------------------------

var keyWifidiagData = 'wifidiag.data';
var keyWifidiagHosts = 'wifidiag.hosts';
var keyWifidiagDataError = 'wifidiag.error';
var keyWifidiagLoading = 'wifidiag.loading';

var keyWifidiagCurrentTab = 'wifidiag.current-tab';

var initData = function() {
  var orgId = Utils.getOrgId(),
    serialNumber = Utils.getSerialNumber();

  if (Session.get(keyWifidiagCurrentTab) == null)
    Session.set(keyWifidiagCurrentTab, 'two');

  Session.set(keyWifidiagLoading, true);
  showWarning.set(false);

  Meteor.call('getWifiSsids', orgId, serialNumber, fake,function(error, result) {
    // Reset refresh flag to false.
    Session.set(keyWifidiagRefreshFlag, false);

    if (error) {
      Session.set(keyWifidiagDataError, error.reason);
      Session.set(keyWifidiagLoading, false);
    } else {
      if(fake){
        result = wlans;
      }
      Session.set(keyWifidiagData, result);
      Session.set(keyWifidiagLoading, false);
      Meteor.call('getAllLanHosts', orgId, serialNumber, fake,function(error, result) {
        if(fake){
          result = lanHosts;
        }
        Session.set(keyWifidiagHosts, result);
      });
    }
  });
};

var cleanup = function() {
  Session.set(keyWifidiagLoading);
  Session.set(keyWifidiagDataError);
  Session.set(keyWifidiagData);
  Session.set(keyWifidiagHosts);
};

var showWarning = new Blaze.ReactiveVar(false);

Template.wifidiag.created = function() {
  Session.set(keyWifidiagRefreshFlag, true)
  this.autorun(function() {
    if (Session.equals(keyWifidiagRefreshFlag, true)) {
      cleanup();
      initData();
    }
  });
};

Template.wifidiag.rendered = function() {
  SmartAdmin.pageSetup();
};

Template.wifidiag.destroyed = function() {
  cleanup();
};

var isActive = function(type) {
  return Session.get(keyWifidiagCurrentTab) === type ? 'active' : '';
};

Template.wifidiag.helpers({
  loading: function() {
    return Session.get(keyWifidiagLoading);
  },

  error: function() {
    return Session.get(keyWifidiagDataError);
  },

  isActive: isActive
});

Template.wifidiag.events({
  'click a[href="#five"]': function(event) {
    Session.set(keyWifidiagCurrentTab, 'five');
    showWarning.set(false);
  },

  'click a[href="#two"]': function(event) {
    Session.set(keyWifidiagCurrentTab, 'two');
    showWarning.set(false);
  }
});

var getChannelUsages = function() {
   var radio = getRadioObj(),utilization=0,interference=0,free=0,nonfree=0;
    if(_.has(radio,'ChannelUtilization')){
       utilization = parseInt(radio.ChannelUtilization); 
    }
    if(_.has(radio,'ChannelInterferenceTime')){
       interference = parseInt(radio.ChannelInterferenceTime); 
    }
    if(_.has(radio,'ChannelFreeTime')){
       free = parseInt(radio.ChannelFreeTime); 
    }else{
       free = 100 - utilization - interference;
    }
    if(free ===0 && utilization===0 && interference === 0) {
       free = 100;
    }
    nonfree = 100 - free;
    return {free:free,nonfree:nonfree,utilization:utilization,interference:interference};
};

Template.wifiChannel.helpers({
  channelAbnormal: function() {
      var usages = getChannelUsages();
      if ((usages.interference > WifiThresholds.InterferenceMax || usages.free < WifiThresholds.FreeMin || usages.utilization > WifiThresholds.UtilizationMax)&& showWarning.get()) {
          return true;
      }     
      return false;
  }
});

var legend = function(parent, data) {
    parent.className = 'legend';
    var datas = data.hasOwnProperty('datasets') ? data.datasets : data;

    while(parent.hasChildNodes()) {
        parent.removeChild(parent.lastChild);
    }

    datas.forEach(function(d) {
        var title = document.createElement('span');
        title.className = 'title';
        parent.appendChild(title);

        var colorSample = document.createElement('div');
        colorSample.className = 'color-sample';
        colorSample.style.backgroundColor = d.hasOwnProperty('strokeColor') ? d.strokeColor : d.color;
        colorSample.style.borderColor = d.hasOwnProperty('fillColor') ? d.fillColor : d.color;
        title.appendChild(colorSample);

        var text = document.createTextNode(d.label);
        title.appendChild(text);
    });
};

  
Template.wifiChannel.rendered = function() {
  var usages = getChannelUsages();


  var color_interference = WifiColors.color_interference,
    color_free = WifiColors.corlor_free;

  var type = Session.get(keyWifidiagCurrentTab);
  if (usages.interference > WifiThresholds.InterferenceMax) {
    color_interference = WifiColors.color_interference_abnormal;
  }
  if (usages.free < WifiThresholds.FreeMin) {
    color_free = WifiColors.color_free_abnormal;
  }

  var chartData;
  if (type === "five") {
    chartData = [{
      value: usages.free,
      color: WifiColors.corlor_free,
      label: "Free"
    }, {
      value: usages.utilization,
      color: WifiColors.color_utilization,
      label: "Utilization"
    }, {
      value: usages.interference,
      color: WifiColors.color_interference,
      label: "Interference"
    }];
  }
  if (type === "two") {
    chartData = [{
      value: usages.free,
      color: WifiColors.corlor_free,
      label: "Free"
    }, {
      value: usages.nonfree,
      color: WifiColors.corlor_nofree,
      label: "NonFree"
    }];
  }
  var options = {
    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
  };

  Chart.defaults.global.tooltipTemplate = "<%if (label){%><%=label%>: <%}%><%= value %>%";

  var domChart = document.getElementById("chart-area-" + type),
    ctx, chart;
  if (domChart) {
    ctx = document.getElementById("chart-area-" + type).getContext("2d");
    chart = new Chart(ctx).Doughnut(chartData);
    legend(document.getElementById("chart-legend-" + type), chartData);
  }
};

var addEventListenerForCollapse = function() {
  $('.panel').on('hidden.bs.collapse', function(e) {
    showWarning.set(false);
  });
  $('.panel').on('shown.bs.collapse', function(e) {
    showWarning.set(true);
  })
};

Template.wifiHighUtilization.rendered = function() {
  addEventListenerForCollapse();
};

Template.wifiHighInterference.rendered = function() {
  addEventListenerForCollapse();
};

Template.wifiWeakSignalWithReducedCapacity.rendered = function() {
  addEventListenerForCollapse();
};

Template.wifiReducedCapacity.rendered = function() {
  addEventListenerForCollapse();
};



Template.wifiDetail.helpers({
  isActive: isActive,
  type: function() {
    return Session.get(keyWifidiagCurrentTab);
  }
});

var bandwidthList = {
  "a": "802.11a",
  "n": "802.11n",
  "b": "802.11b",
  "bgn": "802.11b/g/n",
  "gn": "802.11g/n",
  "bg": "802.11b/g",
  "ac": "802.11ac"
};

var getInitBandwidthValues = function() {
  var standard = this['Standard'];
  return bandwidthList[standard];
};

var getInitBandwidthValuesForDevice = function() {
  var standard = this['DeviceStandard'];
  return bandwidthList[standard];
};

var vendorParamsMapping = {
  "ChannelUtilization": "X_000631_ChannelUtilization",
  "ChannelInterferenceTime": "X_000631_ChannelInterferenceTime",
  "ChannelFreeTime": "X_000631_ChannelFreeTime",
  "OperatingChannelBandwidth": "X_000631_OperatingChannelBandwidth",
  "SignalStrength": "X_000631_SignalStrength",
  "LastDataDownlinkRate": "X_000631_LastDataDownlinkRate",
  "LastDataUplinkRate": "X_000631_LastDataUplinkRate",
  "DeviceStandard": "X_000631_Mode",
  "DfsEnabled": "X_000631_EnableDfsChannels",
  "Icon": "X_000631_Icon",
  "HostNameAlias": "X_000631_HostName_Alias"
};

var getRadioObj = function() {
  var currentTab = Session.get(keyWifidiagCurrentTab);
  var data = Session.get(keyWifidiagData);
  var radio_obj;
  if (currentTab === 'two') {
    radio_obj = Utils.getValueByPath(data, 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.1');
  } else {
    radio_obj = Utils.getValueByPath(data, 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.9');
  }
  if (radio_obj && _.has(radio_obj, vendorParamsMapping.ChannelUtilization)) {
    radio_obj.ChannelUtilization = radio_obj[vendorParamsMapping.ChannelUtilization];
  }
  if (radio_obj && _.has(radio_obj, vendorParamsMapping.ChannelInterferenceTime)) {
    radio_obj.ChannelInterferenceTime = radio_obj[vendorParamsMapping.ChannelInterferenceTime];
  }
  if (radio_obj && _.has(radio_obj, vendorParamsMapping.ChannelFreeTime)) {
    radio_obj.ChannelFreeTime = radio_obj[vendorParamsMapping.ChannelFreeTime];
  }
  if (radio_obj && _.has(radio_obj, vendorParamsMapping.OperatingChannelBandwidth)) {
    radio_obj.OperatingChannelBandwidth = radio_obj[vendorParamsMapping.OperatingChannelBandwidth];
  }
  return radio_obj;
};

var getSsids = function() {
  var currentTab = Session.get(keyWifidiagCurrentTab);
  var data = Session.get(keyWifidiagData);
  var ssid, ssids = [];
  var add2SsidArray = function(start) {
    for (var i = start; i < start + 8; i++) {
      ssid = Utils.getValueByPath(data, 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.' + i);
      if (ssid) {
        ssids.push(ssid);
      }
    }
  };
  if (currentTab === 'two') {
    add2SsidArray(1);
  } else {
    add2SsidArray(9);
  }
  return ssids;
};

var findMatchedDevice = function(device) {
  var lanDevices = Session.get(keyWifidiagHosts);
  var matchedDevice;
  _.each(lanDevices, function(lanDevice) {
    if (lanDevice.MACAddress.toLowerCase() === device.AssociatedDeviceMACAddress.toLowerCase()) {
      matchedDevice = lanDevice;
    }
  });
  return matchedDevice;
};

var getDevices = function() {
  var ssids = getSsids(),
    devices = [],
    matchedDevice;

  _.each(ssids, function(ssid) {
    if (ssid.AssociatedDevice) {
      _.each(ssid.AssociatedDevice, function(device) {
        matchedDevice = findMatchedDevice(device);
        device = _.extend(device, matchedDevice);
        device.SSID = ssid.SSID;
        device.SignalStrength = device[vendorParamsMapping.SignalStrength];
        device.LastDataDownlinkRate = parseInt(device[vendorParamsMapping.LastDataDownlinkRate])/1000
        device.LastDataUplinkRate = parseInt(device[vendorParamsMapping.LastDataUplinkRate])/1000;
        device.DeviceStandard = device[vendorParamsMapping.DeviceStandard];
        device.Icon = device[vendorParamsMapping.Icon];
        device.HostNameAlias = device[vendorParamsMapping.HostNameAlias];
        devices.push(device);
      })
    }
  });
  return devices;
};

var nameMap = {
  0: 'Camera',
  1: 'Cell Phone',
  2: 'Computer',
  3: 'Gamming Console',
  4: 'iPhone',
  5: 'IPTV STB',
  6: 'Phone',
  7: 'Printer',
  8: 'PS-3',
  9: 'Router',
  10: 'Satellite Receiver',
  11: 'Server',
  12: 'Video Camera',
  13: 'Wii',
  14: 'X-Box 360',
  15: 'Tablet',
  16: 'Smart TV'
};

var signalWeak = function() {
  var signalStrength = parseInt(this['SignalStrength']);
  if (signalStrength < (WifiThresholds.SignalOne)) {
    return true;
  }
  return false;
};

var downRateLow = function() {
  var downRate = this['LastDataDownlinkRate'];
  var standard = this['DeviceStandard'];
  if(WifiThresholds.DownRate[standard]){
    return downRate < WifiThresholds.DownRate[standard];
  }else{
    return downRate < WifiThresholds.DownRate['a'];
  }
};


var legacyDevice = function(){
  var standard = this['DeviceStandard'].toLowerCase();
  if (standard === 'a' || standard === 'b' || standard === 'g') {
    return true;
  }
  return false;
};

var deviceSignalWeak = function(d) {
  if (signalWeak.call(d) && downRateLow.call(d)) {
    return true;
  }
  return false;
}; 

var deviceDSLow = function(d){
  if (downRateLow.call(d)) {
    return true;
  }
  return false;
};

var deviceLegacy = function(d) {
  if (legacyDevice.call(d)) {
    return true;
  }
  return false;
};

var isRadioFive = function() {
    return Session.get('wifidiag.current')==='five';
};

Template.wifiDevices.helpers({
  devices: function() {
    var devices = getDevices();
    return devices;
  },

  deviceType: function() {
    if(this['Icon']){
      return nameMap[parseInt(this['Icon'])];
    }  
  },

  wirelessMode: function() {
    return getInitBandwidthValuesForDevice.call(this);
  },

  signalIcon: function() {
    var signalStrength = parseInt(this['SignalStrength']);
    if (signalStrength >= (WifiThresholds.SignalOne) && signalStrength < (WifiThresholds.SignalTwo)) {
      return 'wifi-one';
    } else if (signalStrength >= (WifiThresholds.SignalTwo) && signalStrength < (WifiThresholds.SignalThree)) {
      return 'wifi-two';
    } else if (signalStrength >= (WifiThresholds.SignalThree) && signalStrength < (WifiThresholds.SignalFour)) {
      return 'wifi-three';
    } else if (signalStrength >= (WifiThresholds.SignalFour)) {
      return 'wifi-four';
    }
  },

  downRateLow: function() {
    return downRateLow.call(this) && showWarning.get();
  },

  signalWeakShow: function() {
    return signalWeak.call(this) && showWarning.get();
  },

  signalWeak: function() {
    return signalWeak.call(this);
  },

  HostNameOrIpAddress: function() {
    return this.HostNameAlias || this.HostName || this.IPAddress;
  }
});

Template.wifiWeakSignalWithReducedCapacity.helpers({
  reducedCapacity: function() {
    var devices = getDevices();
    if (_.some(devices, deviceDSLow)) {
      return true;
    }
    return false;
  }
});

Template.wifiRecommend.helpers({

  getTemplate: function() {
    // 1. weak signal check
    var devices = getDevices();
    if (_.some(devices, deviceSignalWeak)) {
      return 'wifiWeakSignalWithReducedCapacity';
    }
    if (_.some(devices, deviceDSLow)) {
      return 'wifiReducedCapacity';
    }
    // 2. high interference check
    var radio = getRadioObj();
    var utilization = parseInt(radio.ChannelUtilization);
    var interference = parseInt(radio.ChannelInterferenceTime);
    var free = 100 - utilization - interference;
    if (interference > WifiThresholds.InterferenceMax) {
      return 'wifiHighInterference';
    }

    // 3. high utilization check
    if ((free < WifiThresholds.FreeMin || utilization > WifiThresholds.UtilizationMax) &&  _.some(devices,deviceLegacy)) {
      return 'wifiHighUtilization';
    }
    return 'wifiNoRecommendation';
  }
});

var isRadioFive = function() {
    return Session.get(keyWifidiagCurrentTab)==='five';
};

Template.wifiHighInterference.helpers({
  getRadioObj: getRadioObj,

  autoModeDisable: function() {
    return this.AutoChannelEnable !== 'true';
  },

  dfsModeDisable: function() {
    return Session.get(keyWifidiagCurrentTab)==='five'&&this[vendorParamsMapping.DfsEnabled] !== 'true';
  },

  isRadioFive: isRadioFive
});

Template.wifiHighUtilization.helpers({
  isRadioFive: isRadioFive
});

Template.wifiRadio.helpers({

  radioEnable: function() {
    var radio = getRadioObj();
    if (radio.RadioEnabled === 'true') {
      return 'Enabled'
    }
    return 'Disabled';
  },

  wirelessMode: function() {
    var radio = getRadioObj();
    return getInitBandwidthValues.call(radio);
  },

  channelModel: function() {
    var radio = getRadioObj();
    var channel = radio.Channel;
    if (radio.AutoChannelEnable === 'true') {
      return 'Auto (' + channel + ')';
    } else {
      return 'Manual (' + channel + ')';
    }
  },

  operatingChannel: function() {
    var radio = getRadioObj();
    return radio.Channel;
  },

  channelBandwidth: function() {
    var radio = getRadioObj();
    return radio.OperatingChannelBandwidth;
  },

  packetsSent: function() {
    var ssids = getSsids();
    var sent = 0;
    _.each(ssids, function(ssid) {
      sent += parseInt(ssid.TotalPacketsSent);
    })
    return sent;
  },

  packetsReceived: function() {
    var ssids = getSsids();
    var received = 0;
    _.each(ssids, function(ssid) {
      received += parseInt(ssid.TotalPacketsReceived);
    })
    return received;
  }

});

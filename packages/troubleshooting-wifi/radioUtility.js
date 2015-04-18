Radio = Radio || {};
var radio2Instancetype = '1';
var radio5Instancetype = '9';

var radioEnabledDisplay = 'radioEnabled';
var standardDisplay = 'standard';
var bandwidthDisplay = 'bandwidth';
var channelDisplay = 'channel';
var powerDisplay = 'transmitPower';
var multicastForwardEnableDisplay = 'multicastForwardEnable';
var dfsEnabledDisplay = "dfsEnable";

var radioEnabledStore = 'RadioEnabled';
var standardStore = 'Standard';
var bandwidthStore = 'X_000631_OperatingChannelBandwidth';
var channelStore = 'Channel';
var autoChannelEnableStore = 'AutoChannelEnable';
var powerStore = 'TransmitPower';
var multicastForwardEnableStore = 'X_CALIX_MulticastForwardEnable';
var dfsEnableStore = "X_000631_EnableDfsChannels";

Radio.getParameterNames = function(type) {
  var path;
  var parameters = [radioEnabledStore, standardStore, bandwidthStore, autoChannelEnableStore, channelStore, powerStore];
  if (type === '2') {
    parameters.push(multicastForwardEnableStore);
    path = 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.' + radio2Instancetype + '.';
  } else {
    parameters.push(dfsEnableStore);
    path = 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.' + radio5Instancetype + '.';
  }
  var result = [];
  for (var i = 0; i < parameters.length; i++)
    result.push(path + parameters[i]);
  return result;
};

Radio.getErrorResult = function(error, result, type, radioPath) {
  Session.set('radio' + type, null);
  if (error) {
    Session.set('radio' + type + 'Error', error['reason']);
  } else { //getParameterValues successfully
    var currentObj = Utils.getValueByPath(result, radioPath);
    Session.set('radio' + type, currentObj);
  }
  Session.set('radio' + type + '-summary-ready', true);
};

Radio.parameterNames = {
  '2': Radio.getParameterNames('2'),
  '5': Radio.getParameterNames('5')
};
Radio.path = {
  '2': 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.1',
  '5': 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.9'
};
Radio.radioId = {
  '2': 'radioConfigure2',
  '5': 'radioConfigure5'
};

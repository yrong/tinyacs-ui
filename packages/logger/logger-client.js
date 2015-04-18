var consoleDebug = function(message) {
  if (console != null && console['debug']) {
    console.debug(message);
  } else {
    Meteor._debug(message);
  }
}

Logger = {
  'silly': consoleDebug,
  'debug': consoleDebug,
  'verbose': consoleDebug,
  'info': Log.info,
  'warn': Log.warn,
  'error': Log.error
};

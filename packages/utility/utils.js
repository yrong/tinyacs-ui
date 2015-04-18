Utils = Utils || {};

var wanPath = 'X_CALIX_SXACC_DefaultWanConnectionPath';

// If you'd use regular expression in path, make sure you don't contain any dot (.)
Utils.getValueByPath = function(object, path) {
  var value = object,
    pathArray, i, k, match, re;

  if (!_.isString(path)) return object;
  pathArray = path.split('.');

  if (value == null) return null;
  for (i = 0; i < pathArray.length; i++) {
    if (pathArray[i].length == 0) continue;
    match = /^\/(.*)\/$/.exec(pathArray[i]);
    if (match == null) {
      // normal path
      value = value[pathArray[i]];
    } else {
      // regexp, e.g. /xxx/
      re = new RegExp(match[1]);
      var mk = null;
      for (k in value) {
        if (re.test(k)) {
          mk = k;
          break;
        }
      }
      if (mk == null) value = null;
      else value = value[mk];
    }
    if (value == null) break;
  }

  return value;
};

Utils.buildCpeId = function(serial, oui) {
  var cpeId = {
    'serialNumber': serial
  };

  if (oui != null) {
    cpeId.manufacturerOUI = oui;
  }

  return cpeId;
};

Utils.getWanPathAlias = function() {
  return wanPath;
};

Utils.timeFormat = "MM/DD/YYYY hh:mm:ss A";

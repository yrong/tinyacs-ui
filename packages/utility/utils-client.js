Utils = Utils || {};

// Namespace for SXACC's session key.
var keyNs = 'sxacc.';

var getUrlParamAll = Utils.getUrlParamAll = function() {
  var paramArray = [],
    hash, hashArray = window && window.location.search.substring(1).split('&');

  if (hashArray != null) {
    for (var i = 0; i < hashArray.length; i++) {
      hash = hashArray[i].split('=');
      paramArray.push(hash[0]);
      paramArray[hash[0]] = hash[1];
    }
  }

  return paramArray;
};

var getParamQuery = function() {
  return Router.current().params.query;
};

Utils.getOrgId = function() {
  var userSession = Session.get('userSession');
  if (userSession != null) return userSession.organization.id.toString();

  else return getUrlParamAll()['orgId'] || '50';
};

var getSerialNumber = Utils.getSerialNumber = function() {
  var query = getParamQuery() || getUrlParamAll();
  return (query && query['serialNumber']) || '';
};

Utils.getCpeId = function() {
  return Utils.buildCpeId(getSerialNumber());
};

Utils.getUsername = function() {
  var userSession = Session.get('userSession');
  if (userSession != null) return userSession.userName || 'Dummy CSR User';
};

Utils.getKeyNs = function() {
  var sn = getSerialNumber();
  if (!sn) sn = '<empty>';
  return keyNs + sn + '.';
};


var pnotify = Utils.notify = function(title, text, type, iconClass) {
  var icon = (iconClass == null) ? false : iconClass;

  new PNotify({
    title: title,
    text: text,
    type: type,
    icon: icon
  });
};

Utils.notifyError = function(text) {
  pnotify(i18n('error'), text, 'error');
};

Utils.notifySuccess = function(text) {
  pnotify(i18n('success'), text, 'success');
};

Utils.formatXml = function(text) {
        if (text == undefined) {
          return '';
        }
        
        //remove abundant spaces
        text = '\n' + text.replace(/(<\w+)(\s.*?>)/g,function($0, name, props)
        {
            return name + ' ' + props.replace(/\s+(\w+=)/g," $1");
        }).replace(/>\s*?</g,">\n<");
        
        //encode comments
        text = text.replace(/\n/g,'\r').replace(/<!--(.+?)-->/g,function($0, text)
        {
            var ret = '<!--' + escape(text) + '-->';
            //alert(ret);
            return ret;
        }).replace(/\r/g,'\n');
        
        //adjust format
        var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg;
        var nodeStack = [];
        var output = text.replace(rgx,function($0,all,name,isBegin,isCloseFull1,isCloseFull2 ,isFull1,isFull2){
            var isClosed = (isCloseFull1 == '/') || (isCloseFull2 == '/' ) || (isFull1 == '/') || (isFull2 == '/');
            //alert([all,isClosed].join('='));
            var prefix = '';
            if(isBegin == '!')
            {
                prefix = getPrefix(nodeStack.length);
            }
            else 
            {
                if(isBegin != '/')
                {
                    prefix = getPrefix(nodeStack.length);
                    if(!isClosed)
                    {
                        nodeStack.push(name);
                    }
                }
                else
                {
                    nodeStack.pop();
                    prefix = getPrefix(nodeStack.length);
                }
            
            }
                var ret =  '\n' + prefix + all;
                return ret;
        });
        
        var prefixSpace = -1;
        var outputText = output.substring(1);
        //alert(outputText);
        
        //decode comments
        outputText = outputText.replace(/\n/g,'\r').replace(/(\s*)<!--(.+?)-->/g,function($0, prefix,  text)
        {
            //alert(['[',prefix,']=',prefix.length].join(''));
            if(prefix.charAt(0) == '\r')
                prefix = prefix.substring(1);
            text = unescape(text).replace(/\r/g,'\n');
            var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix ) + '-->';
            //alert(ret);
            return ret;
        });
        
        return outputText.replace(/\s+$/g,'').replace(/\r/g,'\r\n');
};

function getPrefix(prefixIndex) {
        var span = '  ';
        var output = [];
        for(var i = 0 ; i < prefixIndex; ++i)
        {
            output.push(span);
        }
        
        return output.join('');
}

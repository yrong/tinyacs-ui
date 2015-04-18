CpeConnectController = RouteController.extend({
  template: 'connect'
});


var orgId,serialNumber,connectInfo;

Template.connect.created = function() {
  orgId = Utils.getOrgId();
  serialNumber = Utils.getSerialNumber();
  Session.set('connect.loading', true);
  enable_access();
};

Template.connect.rendered = function() {
  SmartAdmin.pageSetup();
  if (localWin) {
    localWin.focus();
  }
};

Template.connect.destroyed = function() {
  Session.set("remoteUrl");
  Session.set('connect.loading', false);
  Session.set('connect.error');
  /*
  if (localWin) {
      localWin.close();
  }*/
};

Template.connect.helpers({
  loading: function() {
    return Session.get("connect.loading");
  },

  remoteUrl: function() {
    return Session.get("remoteUrl");
  },

  error: function() {
    return Session.get("connect.error");
  }


});

var localWin;

var enable_access = function(callback) {
  Meteor.call('remote_enable', orgId, serialNumber, function(error, result) {
    if (error){
      Session.set('connect.error', error.reason);
      Session.set('connect.loading', false);
    } 
    else {
      var url = result.Protocol + "://" + result.IpAddress + ":" + result.Port;
      Session.set("remoteUrl", url);
      Session.set('connect.loading', false);
      connectInfo = result;
      if(callback){
        callback();
      }
    } 
  });
}

var cutThrough = function() {
    var localForm = document.createElement("form");
    localForm.target = "LocalGui";
    localForm.method = "POST"; // or "post" if appropriate
    localForm.action = Session.get("remoteUrl") + "/login.cgi";

    var userInput = document.createElement("input");
    userInput.type = "text";
    userInput.name = "Username";
    if(connectInfo&&connectInfo.username){
      userInput.value = connectInfo.username;
    }else{
      userInput.value = 'support';
    }
    
    localForm.appendChild(userInput);

    var passInput = document.createElement("input");
    passInput.type = "text";
    passInput.name = "Password";
    if(connectInfo&&connectInfo.password){
      passInput.value = connectInfo.password;
    }else{
      passInput.value = 'support';
    }
    localForm.appendChild(passInput);

    localForm.style.display = 'none';

    document.body.appendChild(localForm);

    var w = 800,h = 600;
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    //var localWin = window.open("", "LocalGui", "status=0,title=0,height=600,width=800,scrollbars=1");
    localWin = window.open("", "LocalGui", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    
    if (localWin) {
      localForm.submit();
    } else {
      alert('You must allow popups for this function to work.');
    }
    Meteor.setTimeout(function() {
      //$(event.currentTarget)[0].click();
      localWin.location.href = Session.get("remoteUrl");
    }, 3000);
  };

Template.connect.events({
  'click a.cutThrough': function(event) {
    /*var win = window.open($(event.currentTarget).attr("href"), '_blank');
      win.focus();*/
    //if (first) {
    event.preventDefault();
    enable_access(cutThrough);
  }
});

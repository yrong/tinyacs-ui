
Template.ccLayout.created = function() {
  var paramAll = Utils.getUrlParamAll(),
    orgId = paramAll['orgId'];

  var $body = $('body');
  $body.attr('class', 'smart-style-2');

  console.log('Main template created');
  SmartAdmin.initApp();

  // user
  if (_.isString(orgId) && orgId.length > 0) {
    Session.set('user.orgId', orgId);
  }
  Session.set('user.orgId', '50');
};

Template.ccLayout.rendered = function() {
  SmartAdmin.leftNav();
  SmartAdmin.domReadyMisc();
  SmartAdmin.mainResize();

  SmartAdmin.updateNav(location.pathname);
  SmartAdmin.drawBreadCrumb();

  /*SmartAdmin.pageSetup();*/
  console.log('Main template rendered');
};

Template.ccLayout.destroyed = function() {
  var serialNumber = Session.get('cpe.serialNumber');
  // UNLOAD CPE
  Meteor.call('unloadCpe', serialNumber, function(error) {
    if (error) {
      console.log('Error when unloadCpe with \'' + serialNumber + '\' >> ' + JSON.stringify(error, null, 2));
    }

    console.log('Unloaded CPE with \'' + serialNumber + '\'')
    Session.set('cpe.data');
  });

  console.log('Main template destroyed');
};

Template.ccLayout.helpers({
  isStandalone: function() {
    return Session.equals('cpex.standalone', true);
  },

  validParameter: function() {
    var orgId = Session.get('user.orgId');
    return _.isString(orgId) && orgId.length > 0;
  },

  userOrgId: function() {
    //return Session.get('user.orgId');
    return '50';
  },

  cpeSerialNumber: function() {
    var paramAll = Utils.getUrlParamAll();
    //return paramAll['serialNumber'];
    //return 'CXNK001D8E4A';
    return 'CXNK00186F6B';
  }
});

Template.ccLayout.events({

  // SmartActions
  'click [data-action="userLogout"]': function(e) {
    var $this = $(e.currentTarget);
    SmartAdmin.SmartActions.userLogout($this);
    e.preventDefault();

    //clear memory reference
    $this = null;
  },

  'click [data-action="resetWidgets"]': function(e) {
    var $this = $(e.currentTarget);
    SmartAdmin.SmartActions.resetWidgets($this);
    e.preventDefault();

    //clear memory reference
    $this = null;
  },

  'click [data-action="launchFullscreen"]': function(e) {
    SmartAdmin.SmartActions.launchFullscreen(document.documentElement);
    e.preventDefault();
  },

  'click [data-action="minifyMenu"]': function(e) {
    var $this = $(e.currentTarget);
    SmartAdmin.SmartActions.minifyMenu($this);
    e.preventDefault();

    //clear memory reference
    $this = null;
  },

  'click [data-action="toggleMenu"]': function(e) {
    SmartAdmin.SmartActions.toggleMenu();
    e.preventDefault();
  },

  'click [data-action="toggleShortcut"]': function(e) {
    SmartAdmin.SmartActions.toggleShortcut();
    e.preventDefault();
  },
  // END SmartActions

  
  'click nav a[href="#"]': function(e) {
    e.preventDefault();
  },

  
  'click a[href!="#"]': function(e) {
    var $this = $(e.currentTarget),
      href = $this.attr('href');

    if (!$this.parent().hasClass("active") && !$this.attr('target')) {
      // Cleanup
      SmartAdmin.cleanDatatables();
      SmartAdmin.cleanJavisWidgets();

     
      SmartAdmin.updateNav(href);

    
      SmartAdmin.drawBreadCrumb();
    }
  }

  
});

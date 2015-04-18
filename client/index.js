Router.configure({
  layoutTemplate: 'ccLayout'
});

Router.map(function() {
  this.route('cpe-dashboard', {
    path: '/cpe',
    controller: 'WorkflowsController'
  });

  this.route('troubleshooting-wan', {
    path: '/cpe/troubleshooting-wan',
    controller: 'TroubleshootingWanController'
  });


  this.route('wireless-config', {
    path: '/cpe/wireless-config',
    controller: 'WifiConfigController'
  });

   this.route('netop-workflows', {
    path: '/netop-workflows',
    controller: 'WorkflowsController',
  });

   this.route('netop-swImage', {
    path: '/netop-swImage',
    controller: 'SWImageController'
  });

   this.route('security-config', {
    path: '/cpe/security-config',
    controller: 'SecurityController'
  });

   this.route('backup-restore', {
    path: '/cpe/backup-restore',
    controller: 'BackupRestoreController'
  });

  this.route('cpe-connect', {
    path: '/cpe/cpe-connect',
    controller: 'CpeConnectController'
  });

  // DEMO
  this.route('demo', {
    controller: 'WorkflowsController'
  });
  // END DEMO

  this.route('root', {
    path: '/',
    action: function() {
      this.redirect('cpe-dashboard');
    }
  });
});

Session.set('cpex.standalone', true);

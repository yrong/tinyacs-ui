Package.describe({
  summary: 'Troubleshooting WAN'
});

Package.on_use(function(api) {
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('mrt:moment', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');

  api.use(['logger', 'utility']);
  api.use('acs-server', 'server');
  //api.use('cc-navigation', 'client');
  //api.use('system-util', 'client');

  api.add_files('troubleshooting-wan-server.js', 'server');

  api.add_files(['shared-var.js'], 'client');
  api.add_files(['wan-summary.html'], 'client');
  api.add_files(['ipping.html', 'ipping.js'], 'client');
  api.add_files(['traceroute.html', 'traceroute.js'], 'client');
  api.add_files(['troubleshooting-wan.html', 'troubleshooting-wan.js'], 'client');

  api.export('TroubleshootingWanController');
});

Package.describe({
  summary: 'Download Config Files Management'
});

Package.on_use(function(api) {
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');
  api.use('mrt:moment', 'client');
  api.use('acs-server', 'server');
  api.use('utility', 'client');
  api.use('logger', 'client');

  api.add_files(['configuration.css'], 'client');
  api.add_files(['configuration-summary.html', 'configuration-summary.js', 'configuration-summary-route.js'], 'client');
  api.add_files(['configuration-new.html', 'configuration-new.js'], 'client');
  api.add_files(['configuration-server.js'], 'server');
  api.export('ConfigurationManagementController');
});

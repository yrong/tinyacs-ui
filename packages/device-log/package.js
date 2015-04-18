Package.describe({
  summary: 'ACS <-->Device Logs'
});

Package.on_use(function(api) {
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('mrt:moment', 'client');
  api.use('smartadmin', 'client');
  api.use('acs-server', 'server');
  api.use('utility', 'client');

  api.add_files(['device-log.html', 'device-log.js', 'device-log-route.js'], 'client');
  api.add_files('device-log-server.js', 'server');

});

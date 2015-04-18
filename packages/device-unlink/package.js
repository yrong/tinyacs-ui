Package.describe({
  summary: 'ACS <-->Device Communication Logs'
});

Package.on_use(function(api) {
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('mrt:moment', 'client');
  api.use('smartadmin', 'client');
  api.use('acs-server', 'server');
  api.use('utility', 'client');

  api.add_files(['device-unlink.html', 'device-unlink.js', 'device-unlink-route.js'], 'client');
  api.add_files('device-unlink-server.js', 'server');

});

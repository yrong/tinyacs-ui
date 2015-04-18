Package.describe({
  summary: 'Security Config'
});

Package.on_use(function(api) {
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');
  api.use('utility');
  api.use('acs-server', 'server');

  api.add_files(['security.html', 'security.js', 'security.css'], 'client');
  api.add_files(['security-server.js'], 'server');

  api.export('SecurityController');
});

Package.describe({
  summary: 'LAN Config'
});

Package.on_use(function(api) {
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');
  api.use('underscore', 'client');
  api.use('utility', 'client');
  api.use('acs-server', 'server');

  api.addFiles(['fileserver.html', 'fileserver.js','fileserver_detail.html','fileserver_detail.js'], 'client');
  api.addFiles('fileserver-server.js', 'server');

});

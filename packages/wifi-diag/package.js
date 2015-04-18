Package.describe({ summary: 'Wifi Diagnostic' });

//Npm.depends({"dot-object": "0.3.0"});

Package.on_use(function (api) {
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');
  api.use('utility');
  api.use('acs-server', 'server');
  api.use('logger', 'server');

  api.addFiles(['wifi-diag.html', 'wifi-diag.js','wifi-diag.css','wifi-config.js','wifi-mock.js'], 'client');
  api.addFiles(['wifi-diag-server.js'], 'server');

});


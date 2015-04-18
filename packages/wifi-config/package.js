Package.describe({ summary: 'Wireless Config' });

Package.on_use(function (api) {
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');
  api.use('utility', 'client');
  api.use('acs-server', 'server');
  api.use('logger','client');

  api.add_files('radioUtility.js', 'client');
  api.add_files(['ssid.html', 'ssid.js'], 'client');
  api.add_files(['radio.html', 'radio.js'], 'client');
  api.add_files(['wifi-config-server.js'], 'server');
  api.add_files(['wifi-config.html', 'wifi-config.js'], 'client');

  api.export('WifiConfigController');
});

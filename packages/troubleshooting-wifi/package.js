Package.describe({ summary: 'Troubleshooting Wireless'});

Package.on_use(function (api) {
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');
  api.use('utility', 'client');
  api.use('acs-server', 'server');
  api.use('logger','client');

  api.add_files('radioUtility.js', 'client');
  api.add_files(['troubleshootingSSID.html', 'troubleshootingSSID.js'], 'client');
  api.add_files(['troubleshootingRadio.html', 'troubleshootingRadio.js'], 'client');
  api.add_files(['troubleshootingWifi.html', 'troubleshootingWifi.js'], 'client');

  api.export('TroubleshootingWifiController');
});

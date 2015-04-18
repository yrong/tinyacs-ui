Package.describe({ summary: 'Backup-Restore' });

//Npm.depends({"dot-object": "0.3.0"});

Package.on_use(function (api) {
  api.use('underscore', 'client');
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');
  api.use('utility');
  api.use('acs-server', 'server');

  api.add_files(['br.html', 'br.js'], 'client');
  api.add_files(['br-server.js'], 'server');

  api.export('BackupRestoreController');
});


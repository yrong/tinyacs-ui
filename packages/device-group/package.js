Package.describe({ summary: 'Device Group' });

Package.on_use(function (api) {
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');

  api.use('utility');

  api.use('acs-server', 'server');


  api.addFiles(['group.html','group_detail.html','rule.js','group.js','group_detail.js','group.css'], 'client');
  api.addFiles(['group-server.js'], 'server');


  api.export('GroupController');
  api.export('GroupDetailController');

  //api.export('GroupController');
  //api.export('GroupDetailController');
  api.export('FilteredDevices');
});

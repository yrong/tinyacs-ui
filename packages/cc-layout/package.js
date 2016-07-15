Package.describe({
  summary: 'Consumer CONNECT layout template'
});

Package.on_use(function(api) {
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');
  api.use('utility', 'client');

  api.add_files(['cc-layout.html', 'cc-layout.js'], 'client');

  api.addAssets('img/commandcenter-h82.png', 'client');
});

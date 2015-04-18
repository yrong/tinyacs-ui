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

  api.addFiles(['dial_plan.html', 'dial_plan.js','dial_plan_detail.html','dial_plan_detail.js'], 'client');
  api.addFiles('dial_plan_server.js', 'server');

});

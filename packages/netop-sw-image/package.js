Package.describe({
  summary: 'SW Images'
});

Package.on_use(function(api) {
  Npm.depends({request: '2.53.0'});
  api.use('templating', 'client');
  api.use('iron:router');
  api.use('smartadmin', 'client');
  api.use('acs-server', 'server');
  api.use('utility', 'client');
  //api.use('cc-navigation', 'client');

  api.add_files(['sw-image-server.js'], 'server');
  api.add_files(['sw-image.css'], 'client');
  api.add_files(['sw-image-summary.html', 'sw-image-summary.js', 'sw-image-summary-route.js'], 'client');
  api.add_files(['sw-image-new.html', 'sw-image-new.js'], 'client');
  //api.add_files(['sw-image-update.html', 'sw-image-update.js'], 'client');

  api.export('SWImageController');
});

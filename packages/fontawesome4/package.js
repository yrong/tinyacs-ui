Package.describe({
  summary: 'Fontawesome 4 in Meteor',
  version: '4.2.0'
});

Package.on_use(function(api) {
  // css
  api.add_files('lib/css/font-awesome.css', 'client');
  // fonts
  api.addAssets('lib/fonts/fontawesome-webfont.eot', 'client');
  api.addAssets('lib/fonts/fontawesome-webfont.svg', 'client');
  api.addAssets('lib/fonts/fontawesome-webfont.ttf', 'client');
  api.addAssets('lib/fonts/fontawesome-webfont.woff', 'client');
  // overide font path
  api.add_files('font-awesome-override.css', 'client');
});

Package.describe({
  summary: 'Utilities for CCNG Meteor'
});

Package.on_use(function(api) {
  api.add_files('utils.js');
  api.add_files('utils-client.js', 'client');
  api.add_files('sxacc-styles.css', 'client');
  api.export('Utils');
});

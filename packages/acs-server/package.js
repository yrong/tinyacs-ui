Package.describe({
  summary: 'ACS Nbi Api and Methods'
});

Package.on_use(function(api) {
  //api.use('system-util', 'server');
  api.use('utility', 'server');
  api.use('logger', 'server');

  api.add_files(['acs-nbi.js', 'acs-nbi-utils.js'], 'server');
  api.add_files('acs-methods.js', 'server');
  api.add_files('acs-nbi-utils.js', 'server');

  api.export('AcsNbi');
});

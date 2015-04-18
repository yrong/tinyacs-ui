Package.describe({
  summary: 'Wrapper for winston logger',
  version: '0.1.0'
});

Npm.depends({
  "winston": "0.8.0"
});

Package.on_use(function(api) {
  api.use(['underscore', 'ejson'], 'server');
  api.use('logging', 'client');

  api.add_files('logger-server.js', 'server');
  api.add_files('logger-client.js', 'client');

  api.export('Logger');
});

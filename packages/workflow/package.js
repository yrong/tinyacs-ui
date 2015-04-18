Package.describe({
  summary: 'Workflows'
});

Package.on_use(function(api) {
  api.use('templating', 'client');
  api.use('iron:router', 'client');
  api.use('smartadmin', 'client');

  api.use('mrt:moment', 'client');
  api.use('tsega:bootstrap3-datetimepicker', 'client');
  api.use('acs-server', 'server');
  api.use('utility', 'client');

  api.add_files(['workflow.css'], 'client');
  api.add_files(['workflow-summary.html', 'workflow-summary.js', 'workflow-summary-route.js'], 'client');
  api.add_files(['workflow-status.html', 'workflow-status.js'], 'client');
  api.add_files(['wizard.html', 'wizard.js', 'workflow-new.css'], 'client');
  api.add_files('workflow-server.js', 'server');
  api.add_files('workflow-create-server.js', 'server');

  api.export('WorkflowsController');
});

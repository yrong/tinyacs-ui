// ROUTE CONTROLLER

WorkflowsController = ccRouteController.extend({
  template: 'workflowSummary',
  breadCrumbsToReflectNavTreeSelection: function() {
    return [
      sxa.breadCrumbs.getBreadCrumbFor(sxa.systemUtil.getLabel('cc'), '/cc', sxa.systemUtil.appType.CC),
      sxa.breadCrumbs.getBreadCrumbFor('NetOps', '/network-operations-home', sxa.systemUtil.appType.CC),
      sxa.breadCrumbs.getBreadCrumbFor('Workflows', Router.current().url, sxa.systemUtil.appType.CC)
    ]
  }
});
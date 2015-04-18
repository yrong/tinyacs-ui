// ROUTE CONTROLLER


var deviceUnlinkController = RouteController.extend({
  template: 'UnlinkDevice'
  /*breadCrumbsToReflectNavTreeSelection: function() {
    return [
      sxa.breadCrumbs.getBreadCrumbFor('System Tools', null, sxa.systemUtil.appType.CC),
      sxa.breadCrumbs.getBreadCrumbFor('Communication Log', Router.current().url, sxa.systemUtil.appType.CC)
    ]
  }*/
});

Router.map(function() {
  this.route('unprovisioned', {
    path: '/unprovisioned',
    controller: deviceUnlinkController
  });
});



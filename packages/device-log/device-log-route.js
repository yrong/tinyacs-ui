// ROUTE CONTROLLER

var deviceLogController = RouteController.extend({
  template: 'DeviceLog'
  /*breadCrumbsToReflectNavTreeSelection: function() {
    return [
      sxa.breadCrumbs.getBreadCrumbFor('System Tools', null, sxa.systemUtil.appType.CC),
      sxa.breadCrumbs.getBreadCrumbFor('Communication Log', Router.current().url, sxa.systemUtil.appType.CC)
    ]
  }*/
});

Router.map(function() {
  this.route('devicelog', {
    path: '/devicelog',
    controller: deviceLogController
  });
});



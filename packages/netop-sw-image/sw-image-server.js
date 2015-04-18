Meteor.methods({
  getSWImageCount: function(orgId) {
    return AcsNbi.getNetOpFileCountByType.call(this, orgId, "SW/FW Image");
  },

  getSWImagePage: function(orgId, pageNumber, pageLength) {
    return AcsNbi.getNetOpFilesByType.call(this, orgId, "SW/FW Image", pageNumber, pageLength);
  },

  deleteSWImage: function(orgId, swImageId) {
    return AcsNbi.deleteNetOpFile.call(this, orgId, swImageId);
  },

  getSWImageByName: function(orgId, name) {
    return AcsNbi.getNetOpFileByTypeAndName.call(this, orgId, "SW/FW Image", name);
  },

  createSWImage_CreateFileRecord: function(orgId, swImage) {
    return AcsNbi.createNetOpFile.call(this, orgId, swImage);
  },

  updateSWImage: function(orgId, swImage) {
    return AcsNbi.updateNetOpFile.call(this, orgId, swImage);
  }
});

Router.route('/_sxacc/_sw_upload', function() {
  var req = this.request;
  var resp = this.response;

  if (req.method != 'POST') {
    resp.statusCode = 503;
    resp.end('Unresolved HTTP Method - ' + req.method);
    return;
  }

  var request = Npm.require('request');
  var forwardUrl = req.headers['x-sxacc-file-forward-url'];
  var username = req.headers['x-sxacc-file-username'];
  var password = req.headers['x-sxacc-file-password'];

  delete req.headers['x-sxacc-file-forward-url'];
  delete req.headers['x-sxacc-file-username'];
  delete req.headers['x-sxacc-file-password'];

  var x = request.post(forwardUrl);
  x.auth(username, password, true);

  x.on('error', function(error) {
    resp.statusCode =500;
    resp.statusMessage = error;
    resp.end();
  });
  req.pipe(x).pipe(resp);
}, {
  where: 'server'
});

(function($) {
  if ($ != null && $.validator != null) {
    $.validator.addMethod('ip4address', function(value) {
      var ip4exp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (ip4exp.test(value)) return true;
      return false;
    });
  }
}(jQuery));

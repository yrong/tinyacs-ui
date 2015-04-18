var keyConfigurationNewError = "netop.configurationNew.error";
var keyConfigurationNewUploading = "netop.configurationNew.uploading";
var orgId, configurationFile, configurationObj, configurationCreateValidator;

var cleanupSession = function() {
  Session.set(keyConfigurationNewError, null);
  Session.set(keyConfigurationNewUploading, false);
};

Template.configurationNew.created = function() {
  cleanupSession();
  orgId = Utils.getOrgId();
};

Template.configurationNew.rendered = function() {
  $('#btn-submitConfiguration').prop('disabled', true); //disable submit btn

  $.validator.addMethod("ASCIIString", function(value, element) {
    return this.optional(element) || /^[\x00-\x7F]*$/.test(value);
  }, "Please enter an ASCII string");

  configurationCreateValidator = $('#form-configurationCreate').validate({
    onkeyup: false,
    onfocusout: false,

    rules: {
      configurationName: {
        required: true,
        ASCIIString: true
      },
      configurationDescription: {
        ASCIIString: true
      },
      fileType: {
        required: true
      }
    },

    errorPlacement: function(error, element) {
      error.insertAfter(element.parent());
    }
  });
  //configurationCreateValidator.invalid = {};
};

Template.configurationNew.helpers({
  error: function() {
    return Session.get(keyConfigurationNewError);
  },

  uploading: function() {
    return Session.get(keyConfigurationNewUploading);
  }
});

var enableElements = function() {
  var createForm = $('#form-configurationCreate');
  createForm.find('label[class~="input"]').css('opacity', 1);
  createForm.find('input').prop('disabled', false);
  createForm.find('#confirmCreateDialog button').prop('disabled', false);
  createForm.find('[class~="button"]').removeClass('disabled');
};

var dealCallError = function(error) {
  Session.set(keyConfigurationNewError, error.reason);
  Session.set(keyConfigurationNewUploading, false);
  enableElements();
};

var toggleDialog = function() {
  $('#confirmUpdateDialog').toggle();
  $('#confirmCreateDialog').toggle();
};

var createOrUpdateConfiguration = function(isCreate) {
  var reader, base64Content, match;

  if (configurationFile) {
    reader = new FileReader();
    reader.onload = function() {
      match = /^data:.*;base64,(.*)$/.exec(reader.result);
      if (match != null) {
        base64Content = match[1];
      } else {
        Logger.warn('Connot match Base64 content for config file');
      }
      configurationObj['binaryContent'] = base64Content;
      if (isCreate) {
        Meteor.call('createConfiguration', orgId, configurationObj, function(error, result) {
          if (error) {
            dealCallError(error);
            return;
          }
          Router.go('netop-configurationManagement');
        });
      } else {
        Meteor.call('updateConfiguration', orgId, configurationObj, function(error, result) {
          if (error) {
            dealCallError(error);
            return;
          }
          Router.go('netop-configurationManagement');
        });
      }
    };
    reader.onerror = function() {
      Session.set(keyConfigurationNewError, "The file couldn't be loaded.");
      Session.set(keyConfigurationNewUploading, false);
    }
    // Start reading.
    reader.readAsDataURL(configurationFile);
  }
};

Template.configurationNew.events({
  'change #input-configurationFile': function(event) {
    var currentTarget = $(event.currentTarget);
    var inputFilenameElement = currentTarget.parent().next();

    if (currentTarget[0].files != null && currentTarget[0].files.length > 0) {
      Session.set(keyConfigurationNewError);
      configurationFile = currentTarget[0].files[0];

      var name = configurationFile.name;
      var inputConfigurationNameElement = $('#input-configurationName');
      inputFilenameElement.prop('value', name);
      inputConfigurationNameElement.prop('value', name);
      var index = name.lastIndexOf('.');
      if (index != -1) {
        inputConfigurationNameElement.prop('value', name.slice(0, index));
      }
      $('#input-configurationVersion').val('');
      $('#input-configurationDescription').val('');
      if (configurationCreateValidator.element(inputConfigurationNameElement[0])) {
        $('#btn-submitConfiguration').prop('disabled', false);
      } else {
        $('#btn-submitConfiguration').prop('disabled', true);
      }

      var size = configurationFile.size;
      if (size > 2 * 1024 * 1024) {
        Meteor.setTimeout(function() {
          Session.set(keyConfigurationNewError, "Invalid File Type:too large size " + size / 1024 / 1024 + "M more than 2M limitation");
          $('#btn-submitConfiguration').prop('disabled', true);
        }, 0);
        return;
      }

      var reader = new FileReader();
      reader.onload = function(e) {
        var lines = e.target.result.split(/[\r\n]+/g);
        var pattern, match,find,version,firstLine;

        if (_.isArray(lines) && lines.length > 0) {
          firstLine = lines[0];
          if (firstLine.indexOf("<") === 0) {
            pattern = /^<DslCpeConfig\s(.+?)">/;
            find = _.find(lines, function(line) {
              match = pattern.exec(line);
              if(match){
                return true;
              }else{
                return false;
              }
            });
            if (!find) {
              Session.set(keyConfigurationNewError, "Invalid File Type:only golden config file allowed");
              $('#btn-submitConfiguration').prop('disabled', true);
              return;
            }
            pattern = /^<!--CalixVersion="(.+?)".+type="(.+?)".+/;
            match = pattern.exec(firstLine);
            if (_.isArray(match) && (match.length === 3)) {
              var type = match[2].toLowerCase();
              if (type === 'golden') {
                $('#fileType').val('Configuration File');
                $('#input-configurationVersion').val(match[1]);
              } else {
                Session.set(keyConfigurationNewError, "Invalid File Type:only golden config file allowed");
                $('#btn-submitConfiguration').prop('disabled', true);
                return;
              }
            }else {
              /*Session.set(keyConfigurationNewError, "Invalid File Type: R11.1 Calix Proprietary Header Not Found");
              $('#btn-submitConfiguration').prop('disabled', true);
              return;*/
              pattern = /^<!--CalixVersion="(.+?)".+/;
              match = pattern.exec(firstLine);
              if (_.isArray(match) && (match.length === 2)) {
                $('#fileType').val('Configuration File');
                $('#input-configurationVersion').val(match[1]);
              }else{
                $('#fileType').val('Configuration File');
              }
            }
          } else{
            pattern = /^;CalixVersion="(.+?)"/;
            find = _.find(lines, function(line) {
              match = pattern.exec(line);
              if (_.isArray(match) && match.length === 2) {
                version = match[1];
                return true;
              } else {
                return false;
              }
            });

            if (find) {
              $('#fileType').val('SIP Configuration File');
              $('#input-configurationVersion').val(version);
            } else {
              Session.set(keyConfigurationNewError, "Invalid File Type: Only Golden Config File or SIP config file allowed");
              $('#btn-submitConfiguration').prop('disabled', true);
              return;
            }
          }
        }
      };
      reader.onerror = function() {
        Session.set(keyConfigurationNewError, "The file couldn't be loaded.");
        Session.set(keyConfigurationNewUploading, false);
      };
      reader.readAsText(configurationFile, 'UTF-8');
    }
  },

  'input #input-configurationName,#input-configurationDescription,#fileType': function(event) {
    var element = $(event.currentTarget)[0];
    if (configurationCreateValidator.element(element)) {
      if (configurationCreateValidator.numberOfInvalids() === 0 && $('#input-configurationFilename').prop('value').trim() != "" && $(
        '#input-configurationName').prop('value').trim() != "") { //file and name can't be empty
        $('#btn-submitConfiguration').prop('disabled', false);
      }
    } else {
      $('#btn-submitConfiguration').prop('disabled', true);
    }
  },

  'click #btn-cancelConfiguration': function(event) {
    event.preventDefault();
    Router.go('netop-configurationManagement');
  },

  'click #btn-submitConfiguration': function(event) {
    event.preventDefault();
    var disableElements = function() {
      var createForm = $('#form-configurationCreate');
      createForm.find('label[class~="input"]').css('opacity', 0.65);
      createForm.find('input').prop('disabled', true);
      createForm.find('#confirmCreateDialog button').prop('disabled', true);
      createForm.find('[class~="button"]').addClass('disabled');
    };
    var name = $('#input-configurationName').prop('value');
    configurationObj = {};

    disableElements();
    var type = $('#fileType').val();
    configurationObj['orgId'] = orgId;
    configurationObj['name'] = name;
    configurationObj['description'] = $('#input-configurationDescription').prop('value');
    configurationObj['type'] = type;
    var version = $('#input-configurationVersion').prop('value');
    if (version) {
      configurationObj['version'] = version;
    }
    $('#updateConfirmDialog').toggle();
    Session.set(keyConfigurationNewUploading, true);
    Meteor.call('getConfigurationByNameType', orgId, name, type, function(error, result) {
      if (error) {
        dealCallError(error);
        return;
      }
      if (result.length > 0) {
        configurationObj['_id'] = result[0]['_id'];
        $('#confirmUpdateDialog').find('span').html('The configuration ' + '"' + name + '"' +
          ' already exists. Are you sure you want to Overwrite it?');
        toggleDialog();
      } else {
        createOrUpdateConfiguration(true);
      }
    });
  },

  'click #btn-cancelUpdateDialog': function() {
    event.preventDefault();
    Session.set(keyConfigurationNewUploading, false);
    enableElements();
    toggleDialog();
  },

  'click #btn-confirmUpdateDialog': function() {
    event.preventDefault();
    toggleDialog();
    createOrUpdateConfiguration(false);
  }
});

Template.configurationNew.destroyed = function() {
  cleanupSession();
};

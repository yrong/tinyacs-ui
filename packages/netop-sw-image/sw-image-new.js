var keySWImageNewError = "netop.swImageNew.error";
var keySWImageNewUploading = "netop.swImageNew.uploading";
var orgId, swImage, swImageObj, swImageCreateValidator;

var cleanupSession = function() {
  Session.set(keySWImageNewError, null);
  Session.set(keySWImageNewUploading, false);
};

var SWImageNewController = RouteController.extend({
  template: 'swImageNew'
});

Router.map(function() {
  this.route('swImageNew', {
    path: '/netop-swImage-upload',
    controller: SWImageNewController
  });
});

Template.swImageNew.created = function() {
  cleanupSession();
  orgId = Utils.getOrgId();
};

Template.swImageNew.rendered = function() {
  $('#btn-submitSWImage').prop('disabled', true); //disable submit btn

  $.validator.addMethod("ASCIIString", function(value, element) {
    return this.optional(element) || /^[\x00-\x7F]*$/.test(value);
  }, "Please enter an ASCII string");

  swImageCreateValidator = $('#form-swImageCreate').validate({
    onkeyup: false,
    onfocusout: false,

    rules: {
      swImageName: {
        required: true,
        ASCIIString: true
      },
      swImageDescription: {
        ASCIIString: true
      }
    },

    errorPlacement: function(error, element) {
      error.insertAfter(element.parent());
    }
  });
  swImageCreateValidator.invalid = {};
};

Template.swImageNew.helpers({
  error: function() {
    return Session.get(keySWImageNewError);
  },

  uploading: function() {
    return Session.get(keySWImageNewUploading);
  }
});

var enableElements = function() {
  var createForm = $('#form-swImageCreate');
  createForm.find('label.input').css('opacity', 1);
  createForm.find('#input-swImageFile,#input-swImageFilename,#input-swImageName,#input-swImageDescription').prop('disabled', false);
  createForm.find('#confirmCreateDialog button').prop('disabled', false);
  createForm.find('[class~="button"]').removeClass('disabled');
};

var dealCallError = function(errorInfo) {
  Session.set(keySWImageNewError, errorInfo);
  Session.set(keySWImageNewUploading, false);
  enableElements();
};

var toggleDialog = function() {
  $('#confirmUpdateDialog').toggle();
  $('#confirmCreateDialog').toggle();
};

var createOrUpdateSWImage = function(isCreate, updatedSWImage) {
  var swImageId;

  var deleteSWImage = function(orgId, swImageId, errorMessage) {
    Meteor.call('deleteSWImage', orgId, swImageId, function(error, result) {
      var uploadMessage = "Failed to upload software image: " + errorMessage + ".";
      if (error) {
        Session.set(keySWImageNewError, uploadMessage + "\n And failed to delete the image record, please delete manually.");
        return;
      }
      dealCallError(uploadMessage + " Please try again later.");
    });
  };

  var uploadSWImage = function(uploadUrl, username, password) {
    var oReq = new XMLHttpRequest();
    oReq.onload = function(event) {
      var errorMessage;
      if (this.status >= 400) {
        errorMessage = this.status + ' ' + this.statusText;
        deleteSWImage(orgId, swImageId, errorMessage);
        return;
      }
      Router.go('netop-swImage');
    }
    oReq.onerror = function(event) {
      deleteSWImage(orgId, swImageId, "Network Error");
    }
    oReq.open('POST', '/_sxacc/_sw_upload', true);
    oReq.setRequestHeader('content-type', 'application/octet-stream');
    oReq.setRequestHeader('x-sxacc-file-forward-url', uploadUrl);
    oReq.setRequestHeader('x-sxacc-file-username', username);
    oReq.setRequestHeader('x-sxacc-file-password', password);
    oReq.send(swImage);
  };

  if (isCreate) {
    Meteor.call('createSWImage_CreateFileRecord', orgId, swImageObj, function(error, result) {
      if (error) {
        dealCallError(error.reason);
        return;
      }
      swImageId = result['_id'];
      uploadSWImage(result.uploadUrl, result.username, result.password);
    });
  } else {
    var uploadUrl = swImageObj.uploadUrl;
    var username = swImageObj.username;
    var password = swImageObj.password;
    delete swImageObj.uploadUrl;
    delete swImageObj.username;
    delete swImageObj.password;
    swImageId = swImageObj['_id'];
    Meteor.call('updateSWImage', orgId, swImageObj, function(error, result) {
      if (error) {
        dealCallError(error.reason);
        return;
      }
      uploadSWImage(uploadUrl, username, password);
    });
  }

};

Template.swImageNew.events({
  'change #input-swImageFile': function(event) {
    var currentTarget = $(event.currentTarget);
    var inputFilenameElement = currentTarget.parent().next();
    var reader = new FileReader();

    if (currentTarget[0].files != null && currentTarget[0].files.length > 0) {
      swImage = currentTarget[0].files[0];
      var name = swImage.name;
      var inputSWImageNameElement = $('#input-swImageName');
      inputFilenameElement.prop('value', name);
      inputSWImageNameElement.prop('value', name);
      // Retain ext name
      // var index = name.lastIndexOf('.');
      // if (index != -1) {
      //   inputSWImageNameElement.prop('value', name.slice(0, index));
      // }

      var startPos = 20;
      var endPos = 24;
      var versionLengthBlob = swImage.slice(startPos, endPos);

      reader.onload = function() {
        var versionLength = new DataView(reader.result).getUint32(0);
        startPos = endPos;
        endPos = startPos + versionLength;
        var versionBlob = swImage.slice(startPos, endPos);
        reader.onload = function() {
          var version, endIndex = reader.result.indexOf('\0');
          if (endIndex >= 0) version = reader.result.substr(0, endIndex);
          else version = reader.result;
          $('#input-swImageVersion').prop('value', version);

          startPos = endPos + 524;
          endPos = startPos + 4;
          var encrypted_w_imageLengthBlob = swImage.slice(startPos, endPos);
          reader.onload = function() {
            var encrypted_w_imageLength = new DataView(reader.result).getUint32(0);
            startPos = endPos + encrypted_w_imageLength + 4;
            endPos = startPos + 4;
            var moduleLengthBob = swImage.slice(startPos, endPos);
            reader.onload = function() {
              var moduleLength = new DataView(reader.result).getUint32(0);
              startPos = endPos;
              endPos = startPos + moduleLength;
              var moduleBlob = swImage.slice(startPos, endPos);
              reader.onload = function() {
                var moduleMap = {
                  99: '844G-1',
                  100: '844G-2',
                  101: '854G-1',
                  102: '854G-2',
                  103: '844E-1',
                  104: '844E-2'
                };
                var result = [];
                for (var i = 0; i < (endPos - startPos) / 4; i++) {
                  var value = new DataView(reader.result).getUint32(i * 4);
                  if (moduleMap[value] != null)
                    result.push(moduleMap[value]);
                }
                $('#input-swImageModel').prop('value', result.toString());
              }
              reader.readAsArrayBuffer(moduleBlob); //get module
            }
            reader.readAsArrayBuffer(moduleLengthBob);
          }
          reader.readAsArrayBuffer(encrypted_w_imageLengthBlob);
        }
        reader.readAsText(versionBlob); //get version
      }
      reader.onerror = function() {
        Session.set(keySWImageNewError, "The file couldn't be parsed.");
        Session.set(keySWImageNewUploading, false);
        enableElements();
      }
      reader.readAsArrayBuffer(versionLengthBlob);

      if (swImageCreateValidator.element(inputSWImageNameElement[0])) {
        $('#btn-submitSWImage').prop('disabled', false);
      } else {
        $('#btn-submitSWImage').prop('disabled', true);
      }
    }
  },

  'input #input-swImageName,#input-swImageDescription': function(event) {
    var element = $(event.currentTarget)[0];
    if (swImageCreateValidator.element(element)) {
      if (swImageCreateValidator.numberOfInvalids() === 0 && $('#input-swImageFilename').prop('value').trim() != "" && $(
        '#input-swImageName').prop('value').trim() != "") { //file and name can't be empty
        $('#btn-submitSWImage').prop('disabled', false);
      }
    } else {
      $('#btn-submitSWImage').prop('disabled', true);
    }
  },

  'click #btn-cancelSWImage': function(event) {
    event.preventDefault();
    Router.go('netop-swImage');
  },

  'click #btn-submitSWImage': function(event) {
    event.preventDefault();
    var disableElements = function() {
      var createForm = $('#form-swImageCreate');
      createForm.find('label.input').css('opacity', 0.65);
      createForm.find('#input-swImageFile,#input-swImageFilename,#input-swImageName,#input-swImageDescription').prop('disabled', true);
      createForm.find('#confirmCreateDialog button').prop('disabled', true);
      createForm.find('[class~="button"]').addClass('disabled');
    };
    var name = $('#input-swImageName').prop('value');
    swImageObj = {};

    disableElements();
    swImageObj['name'] = name;
    swImageObj['description'] = $('#input-swImageDescription').prop('value');
    swImageObj['type'] = "SW/FW Image";
    swImageObj['manufacturer'] = 'Calix';

    $('#updateConfirmDialog').toggle();
    Session.set(keySWImageNewUploading, true);
    Session.set(keySWImageNewError);
    Meteor.call('getSWImageByName', orgId, name, function(error, result) {
      if (error) {
        dealCallError(error.reason);
        return;
      }
      if (result.length > 0) {
        _.extend(swImageObj, _.pick(result[0], "_id", "username", "password", "uploadUrl"));
        $('#confirmUpdateDialog').find('span').html('The Software Image ' + '"' + name + '"' +
          ' already exists. Are you sure you want to Overwrite it?');
        toggleDialog();
      } else {
        createOrUpdateSWImage(true);
      }
    });
  },

  'click #btn-cancelUpdateDialog': function() {
    event.preventDefault();
    Session.set(keySWImageNewUploading, false);
    enableElements();
    toggleDialog();
  },

  'click #btn-confirmUpdateDialog': function() {
    event.preventDefault();
    toggleDialog();
    createOrUpdateSWImage(false, swImageObj);
  }
});

Template.swImageNew.destroyed = function() {
  cleanupSession();
};

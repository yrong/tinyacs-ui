var orgId, cpeId;

var ssidRecord = new Object();//flags changed attributes
var ssidPage = new Object();//new values

var ssidId = "ssid_name";
var serviceEnabledId = "serviceEnabled";
var broadcastEanbledId = "broadcastEnabled";
var beaconTypeId = "beaconType";
var encryptionId = "encryption";
var passphraseId = "passphrase";
var hiddenPassphrase = "********";

var encryptionStoreToDisplay = {
    'AESEncryption': 'AES',
    'TKIPEncryption': 'TKIP',
    'TKIPandAESEncryption': 'Both'
};
var encryptionDisplayToStore = _.invert(encryptionStoreToDisplay);

var securityStoreToDisplay = {
    'WPAand11i': 'WPA WPA2 Personal',
    // 'WPA': 'WPA-Personal',
    '11i': 'WPA2-Personal'
};
var securityDisplayToStore = _.invert(securityStoreToDisplay);

var selectedSSIDSecurityOnState = "selectedSSIDSecurityOnState";
var securityOffState = "securityOffState";
var selectedSSIDFormValidator;
var allSSIDNames;


var ssidSetValues_ = function() {
    var obj = new Object();

    if (ssidRecord[ssidId] === 1)
        obj["SSID"] = $("#" + ssidId).prop("value");
    if (ssidRecord[serviceEnabledId] === 1)
        obj["Enable"] = $("#" + serviceEnabledId).prop("checked");
    if (ssidRecord[broadcastEanbledId] === 1)
        obj["SSIDAdvertisementEnabled"] = $("#" + broadcastEanbledId).prop("checked");

    if (ssidRecord[beaconTypeId] === 1) {
        var security = $("#" + beaconTypeId).prop("value");
        obj["BeaconType"] = securityDisplayToStore[security];
        if (typeof obj["BeaconType"] === 'undefined') {
            /*if (security === 'WEP') {
             flag = true;
             beaconType = 'Basic';
             basicEncryptionModes = 'WEPEncryption';
             basicAuthenticationMode = 'EAPAuthentication';
             } else*/
            {
                obj["BeaconType"] = "Basic";
                obj["BasicEncryptionModes"] = "None";
                obj["BasicAuthenticationMode"] = "None";
            }
        }
    }

    if (ssidRecord[encryptionId] === 1) {
        var encryption = encryptionDisplayToStore[$("#" + encryptionId).prop("value")];
        obj["IEEE11iEncryptionModes"] = encryption;
        obj["WPAEncryptionModes"] = encryption;
    }

    if (ssidRecord[passphraseId] === 1) {
        //passphrase changed; empty is allowed.
        //when security is turned off, we clear the password 
        //on the device and in the DB.
        var passphraseField = $("#" + passphraseId);
        var passphrase = null;
        if (passphraseField) {
            passphrase = $("#" + passphraseId).val();
        }
        
        if ((!passphrase) || passphrase === hiddenPassphrase) {
            passphrase = ssidPage[passphraseId];
        } 
        
        obj['PreSharedKey'] = {
            '1': {
                'KeyPassphrase': passphrase
            }
        };
    }

    var selectedObj = Session.get('selected');
    _.extend(selectedObj, obj);

    var setValue = {
        "InternetGatewayDevice": {
            "LANDevice": {
                "1": {
                    "WLANConfiguration": {}
                }
            }
        }
    };
    var index = selectedObj.index;
    setValue.InternetGatewayDevice.LANDevice[1].WLANConfiguration[index] = obj;

    return {
        "index": index,
        "ssidObj": selectedObj,
        "setObj": setValue
    };
};

Template.ssid.created = function() {
    orgId = Utils.getOrgId();
    cpeId = Utils.getCpeId();
};

Template.selectedSSIDForm.created = function() {
    Session.set(selectedSSIDSecurityOnState, true);
};

Template.selectedSSIDForm.rendered = function() {
    var selectedSsidName = Session.get('selected')['SSID'];
    var otherSSIDNames = [], sSIDNames;
    if (this.data['X_000631_OperatingFrequencyBand'] === '' || this.data['X_000631_OperatingFrequencyBand'] === '2.4GHz') {
        sSIDNames = allSSIDNames['2.4GHzSSIDNames'];
    } else {
        sSIDNames = allSSIDNames['5.0GHzSSIDNames'];

    }

    for (var i = 0; i < sSIDNames.length; i++) {
        if (sSIDNames[i] !== selectedSsidName) {
            otherSSIDNames.push(sSIDNames[i]);
        }
    }

    $.validator.addMethod("SSIDName", function(value, element, params) {
        return this.optional(element) || /^[\w\-\.]*$/.test(value);
    }, "The SSID Name may only contain letters, numbers, underscores, dashes, and dots; no spaces allowed.");

    $.validator.addMethod("notDuplication", function(value, element, params) {
        if (this.optional(element))
            return true;
        for (var i = 0; i < params.length; i++) {
            if (params[i] === value) {
                return false;
            }
        }
        return true;
    }, "The assigned SSID name must be unique.");

    $.validator.addMethod("isASCII", function(value, element) {
        return this.optional(element) || /^[\x00-\x7F]*$/.test(value);
    }, "Please input an ASCII string.");

    $.validator.addMethod("isNotStartEndWithWhiteSpace", function(value, element) {
        return (value === '') || !(/^\s+|\s+$/g.test(value));
    }, "The passphrase may not start or end with a space.");

    selectedSSIDFormValidator = $('#' + 'selectedSSID').validate({
        rules: {
            ssidname: {
                required: true,
                SSIDName: true,
                notDuplication: otherSSIDNames
            },
            passphrase: {
                isNotStartEndWithWhiteSpace: true,
                isASCII: true,
                rangelength: [8, 63]
            }
        },

        errorPlacement: function(error, element) {
            error.insertAfter(element.parent());
        }
    });

    $("#passphrase").val(hiddenPassphrase);
    Session.set('passphraseAttribute', 'readonly');
    Session.set('loading', true);
    Meteor.call('getPassphrase', orgId, cpeId, Session.get('selected').index, function(error, result) {
        if (error) {
            Session.set(ssidError, error.reason);
        } else {
            ssidPage[passphraseId] = result;
            if (result && (result !== "")) {
                Session.set('placeholderText', null);
            } else {
                Session.set('placeholderText', i18n("notSetInConsumerConnect"));
            }
        }
        Session.set('loading', false);
    });


};

Template.selectedSSIDForm.destroyed = function() {
    Session.set(selectedSSIDSecurityOnState, true);
    Session.set('selected');
};

Template.ssid.helpers({
    getSsid: function() {
        return Session.get('ssid');
    },

    ready: function() {
        return Session.get('ssid-ready');
    },

    status: function(name) {
        if (this[name] == 'true' || this[name] == true) {
            return 'On';
        }
        return 'Off';
    },

    loading: function() {
        return Session.get('loading') === true;
    },

    wlans: function() {
        var onService = [],
            offService = [];
        var obj;
        allSSIDNames = {
            '2.4GHzSSIDNames': [],
            '5.0GHzSSIDNames': []
        };
        for (var i = 1; i <= 16; i++) {
            obj = Utils.getValueByPath(this, 'InternetGatewayDevice.LANDevice.1.WLANConfiguration.' + i);
            obj['index'] = i;
            obj['style'] = '';
            if (obj['Enable'] === 'true' || obj['Enable'] === true) {
                onService.push(obj);
            } else {
                obj['style'] = "background-color: #eee;color: #999;";
                offService.push(obj);
            }
            if (i <= 8) {
                allSSIDNames['2.4GHzSSIDNames'].push(obj['SSID'])
            } else {
                allSSIDNames['5.0GHzSSIDNames'].push(obj['SSID'])

            }
        }
        return onService.concat(offService);
    },

    selectedInstance: function() {
        return Session.get('selected');
    },

    error: function() {
        return Session.get('ssidError');
    },

    frequencyBand: function() {
        var frequency = Utils.getValueByPath(this, 'X_000631_OperatingFrequencyBand');
        if (frequency === '') {
            frequency = '2.4GHz';
        }
        return frequency;
    },

    beaconType: function() {
        var beaconTypeValue = this['BeaconType'];
        var security = securityStoreToDisplay[beaconTypeValue];
        if (typeof security === 'undefined') {
            if (this['BasicEncryptionModes'] === 'None' && this['BasicAuthenticationMode'] === 'None') {
                this[securityOffState] = true;
                return 'Security Off';
            }
            /* else
             return 'WEP';*/
        }
        this[securityOffState] = false;
        return security;
    },

    encryption: function() {
        return encryptionStoreToDisplay[this['IEEE11iEncryptionModes']];
    },

    rowStyle: function() {
        if (Session.get('selected') && Session.get('selected').index === this.index) {
            return 'background-color: #94C5EF;';
        }
        return this['style'];
    }
});

Template.selectedSSIDForm.helpers({
    isChecked: function(name) {
        return this[name] === 'true' || this[name] === true;
    },

    isSame: function(name, value) {
        return this[name] === value;
    },

    beaconTypes: function(beaconTypeValues) {
        var obj, result = [];
        var beaconTypeArray = beaconTypeValues.split(',');
        for (index = 0; index < beaconTypeArray.length; index++) {
            obj = {
                'selected': false,
                'value': beaconTypeArray[index]
            };
            result.push(obj);
        }
        var beaconType = this['BeaconType'];

        if (beaconType === 'WPAand11i')
            result[0]['selected'] = true;
        /*else if (beaconType === 'WPA')
         result[1]['selected'] = true;*/
        else if (beaconType === '11i')
            result[1]['selected'] = true;
        else if (beaconType === 'Basic') {
            /*
             if (this['BasicEncryptionModes'] === 'None' && this['BasicAuthenticationMode'] === 'None')
             result[4]['selected'] = true;
             else
             result[3]['selected'] = true;*/
            result[2]['selected'] = true; //securityOff
            Session.set(selectedSSIDSecurityOnState, false);
        }
        return result;
    },

    frequencyBand: function() {
        var frequency = Utils.getValueByPath(this, 'X_000631_OperatingFrequencyBand');
        if (frequency === '') {
            frequency = '2.4GHz';
        }
        return frequency;
    },

    securityOn: function() {
        return Session.get(selectedSSIDSecurityOnState);
    },

    passphraseAttribute: function() {
        return Session.get('passphraseAttribute');
    },

    placeholderText: function() {
        return Session.get('placeholderText');
    }
});

var initSsidPage = function(page) {
    page[ssidId] = this["SSID"];
    page[serviceEnabledId] = (this["Enable"] === 'true' || this['Enable'] === true);
    page[broadcastEanbledId] = (this["SSIDAdvertisementEnabled"] === 'true' || this["SSIDAdvertisementEnabled"] === true);

    var beaconType = securityStoreToDisplay[this["BeaconType"]];
    if (typeof beaconType === 'undefined')
        beaconType = "Security Off";
    page[beaconTypeId] = beaconType;
    page[encryptionId] = encryptionStoreToDisplay[this["IEEE11iEncryptionModes"]];
    page[passphraseId] = "";
};


var initSsidRecord = function(record) {
    record[ssidId] = 0;
    record[serviceEnabledId] = 0;
    record[broadcastEanbledId] = 0;
    record[beaconTypeId] = 0;
    record[encryptionId] = 0;
    record[passphraseId] = 0;
};

var isChanged = function(record) {
    var flag = 0;
    var values = _.values(record);
    for (var i = 0; i < values.length; i++) {
        if (values[i] === -1) { //changed & format wrong
            return false;//early return
        }
        if (values[i] === 1) {
            flag = 1;
            break;
        }
    }
    return (flag === 1);
};

var setSubmitStatus = function(record) {
    sensitizeSubmitButton(isChanged(record) === true);
};

var sensitizeSubmitButton = function(isDisabled) {
    $('#ssidSubmit').prop('disabled', !isDisabled);
};

var onChange = function(page, record, selectedValue, id) {
    if (selectedValue !== page[id]) {
        record[id] = 1;
    } else {
        record[id] = 0;
    }
    setSubmitStatus(ssidRecord);
};

Template.ssid.events({
    'mousedown .wlan': function(event) {
        Session.set('selected', this);

        //ssidPage, ssidRecord
        initSsidPage.call(this, ssidPage);
        initSsidRecord(ssidRecord);

        Session.set('ssidError', null);
    },

    'click button[type="cancel"]': function(event) {
        event.preventDefault();
        Session.set('selected', null);
    },

    'click button[type="submit"]': function(event) {
        event.preventDefault();

        Session.set('loading', true);
        Session.set('ssidError', null);
        var obj = ssidSetValues_();
        Meteor.call('setSsid', orgId, cpeId, obj.setObj, function(error, result) {
            if (!error) {
                var ssid = Session.get('ssid');
                ssid.InternetGatewayDevice.LANDevice[1].WLANConfiguration[obj.index] = obj.ssidObj;
                Session.set('ssid', ssid);
                Session.set('selected', null);
            } else {
                Session.set('ssidError', error.reason);
            }
            Session.set('loading', false);
        });
    }
});

Template.selectedSSIDForm.events({
    'change #encryption': function(event) {
        var element = $(event.currentTarget);
        onChange(ssidPage, ssidRecord, element.prop('value'), element.prop('id'));
    },

    'focus #passphrase, input #passphrase': function(event) {
        var element = event.currentTarget;
        var jqElement = $(element);
        var id = jqElement.prop('id');

        if (jqElement.prop('value') === ssidPage[passphraseId]) { //passphrase not changed
            ssidRecord[id] = 0;
        } else { //passphrase has changed
            ssidPage[passphraseId] = $("#" + passphraseId).val();
            if (selectedSSIDFormValidator.element(element) === true) {
                ssidRecord[id] = 1;
            } else {
                ssidRecord[id] = -1;
            }
        }

        setSubmitStatus(ssidRecord);
    },

    'input #ssid_name': function(event) {
        var element = $(event.currentTarget);
        var jqElement = $(element);
        var id = jqElement.prop('id');

        if (jqElement.prop('value') === ssidPage[id]) { //is not changed
            ssidRecord[id] = 0;
        } else { //changed
            if (selectedSSIDFormValidator.element(element) === true) {
                ssidRecord[id] = 1;
            } else {
                ssidRecord[id] = -1;
            }
        }
        setSubmitStatus(ssidRecord);
    },

    'click #serviceEnabled,#broadcastEnabled': function(event) {
        var element = $(event.currentTarget);
        onChange(ssidPage, ssidRecord, element.prop('checked'), element.prop('id'));
    },

    'change #beaconType': function(event) {
        //if set "Security" to be "Security OFF", then don't display "Encryption" & "Passphrase"
        var value = $(event.currentTarget).prop("value");
        if (value === "Security Off") {
            Session.set(selectedSSIDSecurityOnState, false);
            ssidRecord[encryptionId] = 0;//clear flag for passphase change
            ssidRecord[passphraseId] = 0;//clear all changes to passphrase
            //TODO clear passphrase when security is turned off
            //ssidPage[passphraseId] = "";
        } else {
            Session.set(selectedSSIDSecurityOnState, true);
            Session.set('placeholderText', hiddenPassphrase);
        }
        onChange(ssidPage, ssidRecord, value, 'beaconType');
    },

    'click #passphraseToggle': function(event) {
        var element = $(event.currentTarget);
        var displayedPassphrase = "";
        if (element) {
            var passphraseContent = $("#" + passphraseId).val().trim();
            if (element.prop('checked')) {
                // previosuly hidden passphrase becomes visible, field editable
                Session.set('passphraseAttribute', null);
                displayedPassphrase = ssidPage[passphraseId];
                if (ssidRecord[passphraseId] === 0 &&
                    (!displayedPassphrase || (displayedPassphrase === ""))) {
                    Session.set('placeholderText', i18n("notSetInConsumerConnect"));
                } else {
                    Session.set('placeholderText', null);
                }
            } else {
                //hide passphrase, but store its value first
                ssidPage[passphraseId] = passphraseContent;
                displayedPassphrase = hiddenPassphrase;
                Session.set('passphraseAttribute', 'readonly');
            }
        } else {
            //we shouldn't get here; debug
            console.log("PassphraseToggle invisible");
        }
        
        $("#" + passphraseId).val(displayedPassphrase);

    }

});

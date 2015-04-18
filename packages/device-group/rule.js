var operatorsMapping = {'$ne':'Not Equal','$gt':'Greater Than','$gte':'Greater Than Or Equal','$regex':'Contains','$in':'In','$lte':'Less Than or Equal','$lt':'Less Than'};

var allow_filters = [{
    id: 'manufacturer',
    label: 'Manufacturer',
    type: 'string',
    input: 'select',
    values: {type:'db',collection:'device-types',field:'manufacturer'},
    operators: ['$ne']
}, {
    id: 'modelName',
    label: 'Model',
    type: 'string',
    input: 'select',
    multiple: true,
    values: {type:'db',collection:'device-types',field:'modelName',cascade:['manufacturer']},
    operators: ['$ne','$in']
}, {
    id: 'softwareVersion',
    label: 'SW Version',
    type: 'string',
    input: 'select',
    multiple: true,
    values: {type:'db',collection:'device-types',field:'softwareVersion',cascade:['manufacturer','modelName']},
    operators: ['$ne','$in']  
},
{
    id: 'hardwareVersion',
    label: 'HW Version',
    type: 'string',
    input: 'select',
    /*editable: true,*/
    multiple: true,
    values: {type:'db',collection:'device-types',field:'hardwareVersion',cascade:['manufacturer','modelName']},
    operators: ['$ne','$in'/*'$lte','$lt','$gte','$gt'*/] 
},
{
    id: 'serialNumber',
    label: 'FSAN',//SXACC-908 use FSAN instead of 'SerialNumber' 
    type: 'string',
    input: 'text',
    operators: ['$regex'],
    ignoreCase: true,
    equalExclude:true 
}
];

var useKeys = [];

var getValueByPath = function(object, path) {
  var value = object,
    pathArray, i;

  if (path == null || typeof path != 'string') {
    return object;
  }
  pathArray = path.split('.');

  if (value == null) return null;
  for (i = 0; i < pathArray.length; i++) {
    if (!pathArray[i]) continue;

    value = value[pathArray[i]];
    if (value == null) break;
  }

  return value;
};

var removeDuplicatesGetCopy = function (arr) {
    var ret, len, i, j, cur, found;
    ret = [];
    len = arr.length;
    for (i = 0; i < len; i++) {
        cur = arr[i];
        found = false;
        for (j = 0; !found && (j < len); j++) {
            if (cur === arr[j]) {
                if (i === j) {
                    ret.push(cur);
                }
                found = true;
            }
        }
    }
    return ret;
};

var getOperatorOptions = function() {
    var options = [],filter = findOne(this.key),oper_desc,selected = this.oper;
    if(!_.has(filter,'equalExclude')){
        if(!selected){
            options.push({value:'Equals',desc:'Equals',selected:true});
        }else{
           options.push({value:'Equals',desc:'Equals',selected:false}); 
        }
    }
    _.each(filter.operators, function(oper) {
        oper_desc = operatorsMapping[oper];
        if (selected === oper) {
            options.push({
                value: oper,
                desc: oper_desc,
                selected: true
            });
        } else {
            options.push({
                value: oper,
                desc: oper_desc,
                selected: false
            });
        }
    });
    return options;
};

var getValuesFromDb = function(key) {
    var filter = findOne(key);
    var db_filter = {},used_index,used_value,oper_elem,oper_value,value_elem,filter_cascade,value_obj={},value_val={},results,values=[];
    if (filter&&filter.values&&filter.values.cascade) {        
        _.each(filter.values.cascade, function(key_cascade) {
            _.each(useKeys, function(used_) {
                if (key_cascade === used_.key) {
                    used_index = used_.index;
                    used_value = used_.value;
                    
                    oper_elem =  document.getElementById('inputOperator-' + used_index);
                    if (oper_elem) {
                        oper_value = oper_elem.value;
                    }else{
                       oper_value = used_.oper;
                    }
                    value_elem = document.getElementById('inputValue-' + used_index);
                    if(value_elem)
                    {
                        used_value = value_elem.value;                     
                        if(oper_value === '$in'){
                            used_value = getMultiValues(value_elem);
                        }
                    }               
                    filter_cascade = findOne(key_cascade);                   
                    if (oper_value === 'Equals' || oper_value === '') {
                        db_filter[filter_cascade.values.field] = used_value;
                    } else {
                        if (oper_value === '$in' && !used_value) {
                            value_val = getMultiValues(value_elem);
                        }else{
                            value_val =  used_value;
                        }
                        value_obj[oper_value] = value_val;
                        db_filter[filter_cascade.values.field] = value_obj;
                    }
                }
            })
        })
    }
    results = DeviceTypes.find(db_filter).fetch();
    _.each(results, function(type) {
        values.push(getValueByPath(type,filter.values.field));
    })
    values = removeDuplicatesGetCopy(values);
    return values;
};

var getValueOptions = function() {
    var options = [],val_desc,selected = this.value,find = false;
    var filter = findOne(this.key) 
    var values = getValuesFromDb(this.key);
    _.each(values, function(val_) {
        if (_.isArray(selected)) {
            if (contains(selected, val_)) {
                options.push({
                    value: val_,
                    desc: val_,
                    selected: true
                });
                find = true;
            } else {
                options.push({
                    value: val_,
                    desc: val_,
                    selected: false
                });
            }
        } else{
            if (selected === val_) {
                options.push({
                    value: val_,
                    desc: val_,
                    selected: true
                });
                find = true;
            } else {
                options.push({
                    value: val_,
                    desc: val_,
                    selected: false
                });
            }
        }       
    });
    if(!find){
        options.push({value:selected,desc:selected,selected:true});
    }
    return options;
};

var isText = function() {
    var filter = findOne(this.key);
    return filter.input === 'text';
};

var isArray = function() {
    return this.oper === '$in';
};

var allowNew = function() {
    var used = getRules.call(this);
    if (used.length < (allow_filters.length)) {
        return true;
    } else {
        return false;
    }
};

var getRules = function() {
    var rules = [],index = 0,filter,oper='',value_,oper_desc,val_desc;
    useKeys = [];
    if (this && this.cpeFilter) {
        _.each(this.cpeFilter, function(value, key) {
            filter = findOne(key);
            oper = '';
            value_ = value;
            if (typeof value == 'object') {
                for (oper in value) {
                    if (value.hasOwnProperty(oper)&&oper!=='$options') {
                        value_ = value[oper];
                    }
                }
            }
            if(filter.ignoreCase && oper==='$regex' && value_.slice(0,1)==='^' && value_.slice(-1)==='$'){
               value_ =  value_.substring(1,value_.length-1);
            }
            oper_desc = operatorsMapping[oper] || 'Equals';
            val_desc = value_.toString();
            rules.push({
                index: index,
                key: key,
                keydesc: filter.label,
                oper: oper,
                operdesc: oper_desc,
                value: value_,
                valuedesc: val_desc
            });
            useKeys.push({
                index: index,
                key: key,
                oper:oper,
                value:value_
            });
            index++;
        });
    }
    return rules;
};

var getMultiValues = function(e) {
    var result = [];
    var options = e && e.options;
    var opt;
    for (var i = 0, iLen = options.length; i < iLen; i++) {
        opt = options[i];

        if (opt.selected) {
            result.push(opt.value || opt.text);
        }
    }
    return result;
};

var getRulesFromUI = function() {
    var i,j,obj,key,oper,value,value_,value_elem,filter,rule = {};
    for (i = 0; i < useKeys.length; i++) {
        j = useKeys[i].index;
        key = document.getElementById('inputKey-' + j).value;
        oper = document.getElementById('inputOperator-' + j).value;
        value_elem = document.getElementById('inputValue-' + j)
        value = value_elem.value;
        filter = findOne(key);
        if((oper === 'Equals' || oper === '')&& !_.has(filter,'ignoreCase')) {
            rule[key] = value;
        }
        else{
            value_ = {};
            if(oper === '$in') {
                value = getMultiValues(value_elem);
            }else if(oper === 'Equals' || oper === '' && _.has(filter,'ignoreCase')){
                oper = '$regex';
                value_['$options'] = 'i';
                //value = '^' + value + '$';
            }
            else if(oper === '$regex'){
                value_['$options'] = 'i';
            }
            value_[oper] = value;

            rule[key] = value_;
        }
    }
    return rule;
};

var findOne = function(value) {
    var i = allow_filters.length;
    while (i--) {
        if (allow_filters[i].id === value) return allow_filters[i];
    }
    return null;
};


var contains = function(arr, findValue) {
    var i = arr.length;

    while (i--) {
        if (arr[i] === findValue) return true;
    }
    return false;
};

var delRow = function(source) {

    Session.set('rule_error');
    var row = source.id.split('-');
    var rowNum = row[1];
    var key = document.getElementById('inputKey-' + rowNum);
    var addIcon = document.getElementById('addRow-0');

    var i;
    for (i = 0; i < useKeys.length; i++) {
        if(useKeys[i].key === key.value) {
            break;
        }
    }
    var key_index = i; 

    /*start check*/
    var check_key = key.value;

    
    var find = false;
    _.each(useKeys, function(key_) {
        var filter_ = findOne(key_.key);
        if (filter_.values && filter_.values.cascade) {
            _.each(filter_.values.cascade, function(key__) {
                if (key__ === check_key) {
                    Session.set('rule_error', 'cascade elements ' + filter_.label + ' already existed!');
                    find = true;
                }
            });
        }
    });

    if (find) {

        return;
    }


    Session.set('rule_error');
    /*end check*/

    if (useKeys.length > (allow_filters.length)) {
        addIcon.setAttribute('style', 'display:none');
    } else {
        addIcon.setAttribute('style', 'display:block');
    }

    useKeys.splice(key_index, 1);

    var row = document.getElementById('rule-' + rowNum);
    row.parentNode.removeChild(row);
    
};

var setAdvancedUI = function() {
    _.each(useKeys,function(used_) {
        var filter = findOne(used_.key);
        if(filter.editable){
            $("#inputValue-" + used_.index).editableSelect();
        }else if(filter.multiple && used_.oper==='$in') {
            $("#inputValue-" + used_.index).select2();
        }
    })
};

var setCascadeValue = function(source) {
    var row = source.id.split('-');
    var rowNum = row[1];
    //var operator = source.value || '';
    var key = document.getElementById('inputKey-' + rowNum).value;

    _.each(useKeys, function(used_) {
        var filter = findOne(used_.key);
        if (filter.values && filter.values.cascade) {
            if (contains(filter.values.cascade, key)) {
                setValueOptions(document.getElementById('inputOperator-' + used_.index));
            }
        }
    });
};

var setValueOptions = function(source) {
    
    var row = source.id.split('-');
    var rowNum = row[1];
    var operator = source.value || '';
    var key = document.getElementById('inputKey-' + rowNum).value;

    var filter = findOne(key);
    //var inputValue = document.getElementById('inputValue-' + rowNum);
    //inputValue.style.display = 'block';
    var ele_ = $("#inputValue-" + rowNum);
    var parent = ele_.parent();
    var appendNode;
    if (filter.input === 'select') {
        if (filter.editable === true && ele_[0].style.display !== 'none') {
            appendNode = parent.parent();
            parent.remove();
        } else if(filter.multiple === true && ele_[0].style.display !== 'none') {
            appendNode = parent;
            parent.empty();
        }
        else {
            appendNode = parent;
            ele_.remove();
        }
        var newValueSelect = document.createElement('select');
        
        newValueSelect.setAttribute('class', 'form-control');
        newValueSelect.setAttribute('id', 'inputValue-' + rowNum);
        newValueSelect.setAttribute('style', 'display:block');
        newValueSelect.options.length = 0;
        var sel_index = 0;
        var vals = getValuesFromDb(key);
        _.each(vals, function(val_) {
            newValueSelect.options[sel_index] = new Option(val_);
            sel_index++;
        });
        appendNode[0].appendChild(newValueSelect);
        if (filter.editable === true) {
            $(newValueSelect).editableSelect();
        }
        if (operator === '$in' && filter.multiple === true) {
            newValueSelect.multiple = true;
            $(newValueSelect).select2();
        }
    } else {
        ele_.show();
    }
};


var setOperatorOptions = function(source) {
    Session.set('rule_error');
    var row = source.id.split('-');
    var rowNum = row[1];
    var key = source.value;

    var operator = document.getElementById('inputOperator-' + rowNum);
    operator.style.display = 'block';
    operator.options.length = 0;
    
    var filter = findOne(key);

    var i = 0;
    for (i = 0; i < useKeys.length; i++) {
        if(useKeys[i].key === key || useKeys[i].index === parseInt(rowNum)) {
            break;
        }
    }
    var key_index = i;    
    useKeys.splice(key_index, 1);

    var find = false;
    var filter_;
    if (filter.values&&filter.values.cascade) {
        _.each(filter.values.cascade, function(key_) {
            find = false;
            filter_ = findOne(key_);
            _.each(useKeys, function(used_) {
                if (used_.key === key_) {
                    find = true;
                }
            });
            if (!find) {
                Session.set('rule_error', 'missing cascade attributes:' + filter_.label);
                return;
            }
        });
        if (!find) {
            Session.set('rule_error', 'missing cascade attributes:' + filter_.label);
            return;
        }
    }
    
    Session.set('rule_error',null);
    operator.options[0] = new Option("","");
    var j;
    if(!_.has(filter,'equalExclude'))
    {
       operator.options[1] = new Option("Equals","");
       j=2; 
    }else{
       j=1;
    }
    for (i = 0; i < filter.operators.length; i++) {
        var oper_val = filter.operators[i];
        var oper_desc = operatorsMapping[oper_val];
        operator.options[j] = new Option(oper_desc,oper_val);
        j++;
    }
    useKeys.push({index:parseInt(rowNum),key:key});
};

var addRow = function() {
    
    
    Session.set('rule_error');
    var rulesDiv = document.getElementById('allRules');
    var addIcon = document.getElementById('addRow-0');
    
    var index = useKeys.length;
    if (index > (allow_filters.length - 2)) {
        addIcon.setAttribute('style', 'display:none');
    } else {
        addIcon.setAttribute('style', 'display:block');
        if(!index) {
            Session.set('rule_error',null);
        }
    }
    var i = 0,max = 0;
    for (i = 0; i < useKeys.length; i++) {
        if(useKeys[i].index>max) {
            max = useKeys[i].index;
        }
    }
    index = max +1;
    var newRow = document.createElement('div');
    newRow.setAttribute('id', 'rule-' + index);
    newRow.setAttribute('class', 'row');
    newRow.setAttribute('style', 'margin-bottom:15px');

    var newKeySelect = document.createElement('select');
    newKeySelect.setAttribute('class', 'form-control');
    newKeySelect.setAttribute('id', 'inputKey-' + index);

    i = 0;
    var j = 1;
    var k = 0;
    var find = false;
    newKeySelect.options[0] = new Option('','');
    for (i = 0; i < allow_filters.length; i++) {
        find = false;
        for (k = 0; k < useKeys.length; k++) {
            if(useKeys[k].key === allow_filters[i].id) {
                find = true;
                break;
            }
        }
        if (!find) {
            newKeySelect.options[j] = new Option(allow_filters[i].label, allow_filters[i].id);
            j++;
        }
    }

    var newKeyDiv = document.createElement('div');
    newKeyDiv.setAttribute('class', 'col-xs-12 col-sm-12 col-md-3 col-lg-3');


    var newOperatorSelect = document.createElement('select');
    newOperatorSelect.setAttribute('class', 'form-control');
    newOperatorSelect.setAttribute('id', 'inputOperator-' + index);
    newOperatorSelect.setAttribute('style', 'display:none');

    var newOperatorDiv = document.createElement('div');
    newOperatorDiv.setAttribute('class', 'col-xs-12 col-sm-12 col-md-4 col-lg-4');

    var newValueText = document.createElement('input');
    newValueText.setAttribute('class', 'form-control');
    newValueText.setAttribute('id', 'inputValue-' + index);
    newValueText.setAttribute('style', 'display:none');

    var newValueDiv = document.createElement('div');
    newValueDiv.setAttribute('class', 'col-xs-12 col-sm-12 col-md-4 col-lg-4');


    var newDeleteIcon = document.createElement('i');
    newDeleteIcon.setAttribute('class', 'fa fa-lg fa-fw fa-trash-o pull-right');
    newDeleteIcon.setAttribute('id', 'deleteRow-' + index);
    newDeleteIcon.setAttribute('style', 'margin-top:9px');

    var newDeleteDiv = document.createElement('div');
    newDeleteDiv.setAttribute('class', 'col-xs-12 col-sm-12 col-md-1 col-lg-1');

    newKeyDiv.appendChild(newKeySelect);
    newRow.appendChild(newKeyDiv);

    newOperatorDiv.appendChild(newOperatorSelect);
    newRow.appendChild(newOperatorDiv);

    newValueDiv.appendChild(newValueText);
    newRow.appendChild(newValueDiv);

    newDeleteDiv.appendChild(newDeleteIcon);
    newRow.appendChild(newDeleteDiv);

    rulesDiv.appendChild(newRow);

};

CpeRules = {};

CpeRules.delRow = delRow;
CpeRules.setOperatorOptions = setOperatorOptions;
CpeRules.setValueOptions = setValueOptions;
CpeRules.setCascadeValue = setCascadeValue;
CpeRules.addRow = addRow;
CpeRules.getRulesFromUI = getRulesFromUI;
CpeRules.getRules = getRules;
CpeRules.getValueOptions = getValueOptions;
CpeRules.getOperatorOptions = getOperatorOptions;
CpeRules.isArray = isArray;
CpeRules.isText = isText;
CpeRules.setAdvancedUI = setAdvancedUI;

CpeRules.allowNew = allowNew;

CpeRules.allow_filters = allow_filters;
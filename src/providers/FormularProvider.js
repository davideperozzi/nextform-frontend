goog.provide('nextform.providers.FormularProvider');

// goog
goog.require('goog.structs.Map');
goog.require('goog.dom.forms');

/**
 * @construct
 */
nextform.providers.FormularProvider = function()
{
    /**
     * @private
     * @type {nextform.models.FormularModel}
     */
    this.formular_ = null;

    /**
     * @private
     * @type {goog.structs.Map<string, string>}
     */
    this.config_ = new goog.structs.Map();
};

/**
 * @const
 * @type {string}
 */
nextform.providers.FormularProvider.SESSION_FIELD_NAME = '_73d39f2e64de879f0876fdaec6c96a16';

/**
 * @public
 * @param {nextform.models.FormularModel} formular
 */
nextform.providers.FormularProvider.prototype.parse = function(formular)
{
    this.formular_ = formular;
    this.update();
};

/**
 * @public
 * @return {nextform.models.FormularModel}
 */
nextform.providers.FormularProvider.prototype.getModel = function()
{
    return this.formular_;
};

/**
 * @public
 * @return {boolean}
 */
nextform.providers.FormularProvider.prototype.hasFileField = function()
{
    var fileFieldFound = false;

    this.formular_.fields.forEach(function(field){
        if (fileFieldFound) {
            return;
        }

        for (var i = 0, len = field.elements.length; i < len; i++) {
            var element = field.elements[i];

            if (this.isFileElement_(element)) {
                fileFieldFound = true;
            }
        }
    }, this);

    return fileFieldFound;
};

/**
 * @public
 * @return {boolean}
 */
nextform.providers.FormularProvider.prototype.hasSessionField = function()
{
    return this.formular_.fields.containsKey(
        nextform.providers.FormularProvider.SESSION_FIELD_NAME);
};

/**
 * @public
 * @return {string}
 */
nextform.providers.FormularProvider.prototype.getSessionFieldName = function()
{
    return nextform.providers.FormularProvider.SESSION_FIELD_NAME;
};

/**
 * @public
 * @return {string}
 */
nextform.providers.FormularProvider.prototype.getSessionFieldValue = function()
{
    var field = this.formular_.fields.get(
        nextform.providers.FormularProvider.SESSION_FIELD_NAME);

    if (field) {
        if (field.elements.length == 1) {
            return this.getFieldValue(field);
        }
    }

    return '';
};

/**
 * @public
 * @return {goog.structs.Map<string, Array<Element>>}
 */
nextform.providers.FormularProvider.prototype.getFileElements = function()
{
    var fields = new goog.structs.Map();

    this.formular_.fields.forEach(function(field, name){
        for (var i = 0, len = field.elements.length; i < len; i++) {
            var element = field.elements[i];

            if (this.isFileElement_(element)) {
                if (fields.containsKey(name)) {
                    fields.get(name).push(element);
                }
                else {
                    fields.set(name, [element]);
                }
            }
        }
    }, this);

    return fields;
};

/**
 * @public
 * @return {string}
 */
nextform.providers.FormularProvider.prototype.getName = function()
{
    return this.formular_.element.hasAttribute('name')
            ? this.formular_.element.getAttribute('name')
            : '';
};

/**
 * @private
 * @param {Element} element
 * @return {boolean}
 */
nextform.providers.FormularProvider.prototype.isFileElement_ = function(element)
{
    return element.hasAttribute('type') &&
           element.getAttribute('type') == 'file';
};

/**
 * @param {Element} element
 * @return {nextform.models.fields.AbstractFieldModel}
 */
nextform.providers.FormularProvider.prototype.getFieldByElement = function(element)
{
    var fields = this.formular_.fields.getValues();

    for (var i = 0, len = fields.length; i < len; i++) {
        if (this.isElementInField_(fields[i], element)) {
            return fields[i];
        }
    }

    return null;
};

/**
 * @private
 * @return {boolean}
 */
nextform.providers.FormularProvider.prototype.isElementInField_ = function(field, element)
{
    for (var i = 0, len = field.elements.length; i < len; i++) {
        if (field.elements[i] == element) {
            return true;
        }
    }

    if (field.fields.length > 0) {
        for (var i = 0, len = field.fields.length; i < len; i++) {
            if (this.isElementInField_(field.fields[i], element)) {
                return true;
            }
        }
    }

    return false;
};

/**
 * @public
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @return {*}
 */
nextform.providers.FormularProvider.prototype.getFieldValue = function(field)
{
    if (field instanceof nextform.models.fields.CollectionFieldModel) {
        return this.getFieldCollectionValue(field);
    }

    if (field.elements.length == 1) {
        var element = field.elements[0];

        switch (element.tagName.toLowerCase()) {
            case 'input':
            case 'textarea':
                if (element.getAttribute('type') == 'file') {
                    return element.files;
                }

                return element.value;
                break;

            case 'select':
                return element.options[element.selectedIndex].value;
                break;
        }
    }

    return '';
};

/**
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @return {*}
 */
nextform.providers.FormularProvider.prototype.getFieldCollectionValue = function(field)
{
    switch (field.sharedType) {
        case 'radio':
            return this.getRadioFieldValue_(field);
            break;

        case 'checkbox':
            return this.getCheckboxValue_(field, field.name.endsWith('[]'));
            break;
    }

    return '';
};

/**
 * @private
 * @param {nextform.models.fields.AbstractFieldModel} parent
 * @return {string}
 */
nextform.providers.FormularProvider.prototype.getRadioFieldValue_ = function(parent)
{
    for (var i = 0, len = parent.fields.length; i < len; i++) {
        var field = parent.fields[i];

        for (var i1 = 0, len1 = field.elements.length; i1 < len1; i1++) {
            var element = field.elements[i1];

            if (element.checked) {
                return element.value;
            }
        }
    }

    return '';
};

/**
 * @private
 * @param {nextform.models.fields.AbstractFieldModel} parent
 * @param {boolean} multiple
 * @return {Array<string>|string}
 */
nextform.providers.FormularProvider.prototype.getCheckboxValue_ = function(parent, multiple)
{
    var values = [];

    for (var i = 0, len = parent.fields.length; i < len; i++) {
        var field = parent.fields[i];

        for (var i1 = 0, len1 = field.elements.length; i1 < len1; i1++) {
            var element = field.elements[i1];

            if (element.checked) {
                if (multiple) {
                    values.push(element.value);
                }
                else {
                    return element.value;
                }
            }
        }
    }

    return values;
};

/**
 * @public
 */
nextform.providers.FormularProvider.prototype.update = function()
{
    var formElement = this.formular_.element;

    if (formElement.hasAttribute('action')) {
        this.config_.set('action', formElement.getAttribute('action'));
    }

    if (formElement.hasAttribute('method')) {
        this.config_.set('method', formElement.getAttribute('method'));
    }
};

/**
 * @public
 * @param {string} name
 * @return {string}
 */
nextform.providers.FormularProvider.prototype.getConfig = function(name)
{
    if ( ! this.config_.containsKey(name)) {
        throw new Error('Config "' + name + '" not found in formular');
    }

    return this.config_.get(name);
};

/**
 * @public
 * @return {goog.structs.Map<string, *>}
 */
nextform.providers.FormularProvider.prototype.getData = function()
{
    return goog.dom.forms.getFormDataString(this.formular_.element);
};
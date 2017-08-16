goog.provide('nextform.providers.FormProvider');

// goog
goog.require('goog.array');
goog.require('goog.dom.forms');
goog.require('goog.structs.Map');
goog.require('goog.dom.InputType');

/**
 * @constructor
 */
nextform.providers.FormProvider = function()
{
    /**
     * @private
     * @type {nextform.models.FormModel}
     */
    this.form_ = null;

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
nextform.providers.FormProvider.SESSION_FIELD_NAME = '_73d39f2e64de879f0876fdaec6c96a16';

/**
 * @public
 * @param {nextform.models.FormModel} form
 */
nextform.providers.FormProvider.prototype.parse = function(form)
{
    this.form_ = form;
    this.update();
};

/**
 * @public
 * @return {nextform.models.FormModel}
 */
nextform.providers.FormProvider.prototype.getModel = function()
{
    return this.form_;
};

/**
 * @public
 * @return {boolean}
 */
nextform.providers.FormProvider.prototype.hasFileField = function()
{
    var fileFieldFound = false;

    this.form_.fields.forEach(function(field){
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
nextform.providers.FormProvider.prototype.hasSessionField = function()
{
    return this.form_.fields.containsKey(
        nextform.providers.FormProvider.SESSION_FIELD_NAME);
};

/**
 * @public
 * @return {string}
 */
nextform.providers.FormProvider.prototype.getSessionFieldName = function()
{
    return nextform.providers.FormProvider.SESSION_FIELD_NAME;
};

/**
 * @public
 * @return {string}
 */
nextform.providers.FormProvider.prototype.getSessionFieldValue = function()
{
    var field = this.form_.fields.get(
        nextform.providers.FormProvider.SESSION_FIELD_NAME);

    if (field) {
        if (field.elements.length == 1) {
            var value = this.getFieldValue(field);

            if (goog.isString(value)) {
                return /** @type {string} */ (value);
            }
        }
    }

    return '';
};

/**
 * @public
 * @return {goog.structs.Map<string, Array<Element>>}
 */
nextform.providers.FormProvider.prototype.getFileElements = function()
{
    var fields = new goog.structs.Map();

    this.form_.fields.forEach(function(field, name){
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
nextform.providers.FormProvider.prototype.getName = function()
{
    return this.form_.element.hasAttribute('name')
            ? this.form_.element.getAttribute('name')
            : '';
};

/**
 * @private
 * @param {Element} element
 * @return {boolean}
 */
nextform.providers.FormProvider.prototype.isFileElement_ = function(element)
{
    return element.hasAttribute('type') &&
           element.getAttribute('type') == 'file';
};

/**
 * @param {Element} element
 * @return {nextform.models.fields.AbstractFieldModel}
 */
nextform.providers.FormProvider.prototype.getFieldByElement = function(element)
{
    var fields = this.form_.fields.getValues();

    for (var i = 0, len = fields.length; i < len; i++) {
        if (this.isElementInField_(fields[i], element)) {
            return fields[i];
        }
    }

    return null;
};

/**
 * @public
 * @param {nextform.models.fields.AbstractFieldModel=} optField
 * @return {Array<Element>}
 */
nextform.providers.FormProvider.prototype.getFieldElements = function(optField)
{
    var elements = [];

    if (optField) {
        if (optField instanceof nextform.models.fields.AbstractFieldModel) {
            for(var i = 0, len = optField.fields.length; i < len; i++) {
                var fieldElements = optField.fields[i].elements;

                for (var i1 = 0, len1 = fieldElements.length; i1 < len1; i1++) {
                    elements.push(fieldElements[i]);
                }

                if (optField.fields[i].fields.length > 0) {
                    elements = goog.array.concat(this.getFieldElements(optField.fields[i]), elements);
                }
            }
        }
        else {
            throw new Error('Invalid field given to traverse through elements');
        }
    }
    else {
        this.form_.fields.forEach(function(field){
            for (var i = 0, len = field.elements.length; i < len; i++) {
                elements.push(field.elements[i]);
            }

            if (field.fields.length > 0) {
                elements = goog.array.concat(this.getFieldElements(field), elements);
            }
        });
    }

    return elements;
};

/**
 * @private
 * @return {boolean}
 */
nextform.providers.FormProvider.prototype.isElementInField_ = function(field, element)
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
nextform.providers.FormProvider.prototype.getFieldValue = function(field)
{
    if (field instanceof nextform.models.fields.CollectionFieldModel) {
        return this.getFieldCollectionValue(
            /** @type {nextform.models.fields.CollectionFieldModel}*/ (field)
        );
    }

    if (field.elements.length == 1) {
        var element = field.elements[0];

        switch (element.tagName.toLowerCase()) {
            case 'input':
            case 'textarea':
                if (element.getAttribute('type') == goog.dom.InputType.FILE) {
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
 * @param {nextform.models.fields.CollectionFieldModel} field
 * @return {*}
 */
nextform.providers.FormProvider.prototype.getFieldCollectionValue = function(field)
{
    switch (field.sharedType) {
        case goog.dom.InputType.RADIO:
            return this.getRadioFieldValue_(field);
            break;

        case goog.dom.InputType.CHECKBOX:
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
nextform.providers.FormProvider.prototype.getRadioFieldValue_ = function(parent)
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
nextform.providers.FormProvider.prototype.getCheckboxValue_ = function(parent, multiple)
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
nextform.providers.FormProvider.prototype.update = function()
{
    var formElement = this.form_.element;

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
nextform.providers.FormProvider.prototype.getConfig = function(name)
{
    if ( ! this.config_.containsKey(name)) {
        throw new Error('Config "' + name + '" not found in form');
    }

    return this.config_.get(name);
};

/**
 * @public
 * @return {string}
 */
nextform.providers.FormProvider.prototype.getData = function()
{
    return goog.dom.forms.getFormDataString(this.form_.element);
};
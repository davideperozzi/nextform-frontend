goog.provide('nextform.providers.FormProvider');

// goog
goog.require('goog.array');
goog.require('goog.crypt.Md5');
goog.require('goog.dom.forms');
goog.require('goog.structs.Map');
goog.require('goog.dom.InputType');

// nextform
goog.require('nextform.helpers.files');

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

    /**
     * @private
     * @type {boolean}
     */
    this.changed_ = false;

    /**
     * @private
     * @type {dj.sys.managers.ComponentManager}
     */
    this.componentManager_ = null;
};

/**
 * @const
 * @type {string}
 */
nextform.providers.FormProvider.SESSION_FIELD_NAME = '_73d39f2e64de879f0876fdaec6c96a16';

/**
 * @public
 * @param {dj.sys.managers.ComponentManager} manager
 */
nextform.providers.FormProvider.prototype.setManager = function(manager)
{
    this.componentManager_ = manager;
};

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
nextform.providers.FormProvider.prototype.hasChanged = function()
{
    this.setValueHashes_();

    return this.valueHashesChanged_();
};

/**
 * @public
 * @param {boolean} changed
 */
nextform.providers.FormProvider.prototype.setChanged = function(changed)
{
    this.changed_ = changed;
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
 * @private
 * @return {boolean}
 */
nextform.providers.FormProvider.prototype.valueHashesChanged_ = function()
{
    var changed = false;

    this.form_.fields.forEach(function(field, name){
        if (field.currentValueHash != field.lastValueHash) {
            changed = true;
        }
    });

    return changed;
};

/**
 * @private
 */
nextform.providers.FormProvider.prototype.setValueHashes_ = function()
{
    this.form_.fields.forEach(function(field, name){
        field.lastValueHash = field.currentValueHash;
        field.currentValueHash = this.getValueHash_(field);
    }, this);
};

/**
 * @private
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @return {string}
 */
nextform.providers.FormProvider.prototype.getValueHash_ = function(field)
{
    var md5 = new goog.crypt.Md5();
    var value = this.getFieldValue(field);

    md5.update(field.name);

    if (goog.isArray(value)) {
        goog.array.forEach(value, function(val){
            if (val instanceof File) {
                md5.update(nextform.helpers.files.signature(val));
            }
            else if (goog.isString(val)) {
                md5.update(val);
            }
        })
    }
    else if (goog.isString(value)) {
        md5.update(value);
    }

    return goog.crypt.byteArrayToHex(md5.digest())
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
 * @param {nextform.models.fields.AbstractFieldModel=} optParent
 * @param {boolean=} optRecursive
 * @return {goog.structs.Map<string, Array<Element>>}
 */
nextform.providers.FormProvider.prototype.getFileElements = function(optParent, optRecursive)
{
    var fields = this.getFileFields(optParent, optRecursive);
    var elements = new goog.structs.Map();

    fields.forEach(function(field, name){
        elements.set(name, field.elements);
    }, this);

    return elements;
};

/**
 * @public
 * @param {nextform.models.fields.AbstractFieldModel=} optParent
 * @param {boolean=} optRecursive
 * @return {goog.structs.Map<string, nextform.models.fields.AbstractFieldModel>}
 */
nextform.providers.FormProvider.prototype.getFileFields = function(optParent, optRecursive)
{
    var foundFields = new goog.structs.Map();
    var searchFields = optParent ? optParent.fields : this.form_.fields.getValues();

    for (var i = 0, len = searchFields.length; i < len; i++) {
        var currentField = searchFields[i];
        var types = goog.array.map(currentField.elements, this.getType_, this);

        goog.array.removeDuplicates(types);

        if (types.length == 1 && types[0] == goog.dom.InputType.FILE) {
            foundFields.set(currentField.name, currentField);
        }

        if (optRecursive && currentField.fields.length > 0) {
            foundFields.addAll(this.getFileFields(currentField, optRecursive));
        }
    }

    return foundFields;
};

/**
 * @private
 * @param {Element} element
 * @return {nextform.components.AbastractFieldComponent}
 */
nextform.providers.FormProvider.prototype.getComponent_ = function(element)
{
    if (this.componentManager_) {
        var component = this.componentManager_.getComponentByElement(element);

        if (component && component instanceof nextform.components.AbastractFieldComponent) {
            return /** @type {nextform.components.AbastractFieldComponent} */ (component);
        }
    }

    return null;
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
    return this.getType_(element) == 'file';
};

/**
 * @private
 * @param {Element} element
 * @return {string}
 */
nextform.providers.FormProvider.prototype.getType_ = function(element)
{
    if (element.hasAttribute('type')) {
        return element.getAttribute('type').toLowerCase();
    }

    return '';
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
        var component = this.getComponent_(element);

        if (component) {
            return component.getValue();
        }
        else {
            switch (element.tagName.toLowerCase()) {
                case 'input':
                case 'textarea':
                    if (this.getType_(element) == goog.dom.InputType.FILE) {
                        return element.files;
                    }

                    if (this.getType_(element) == goog.dom.InputType.CHECKBOX) {
                        return element.checked ? element.value : '';
                    }

                    return element.value;
                    break;

                case 'select':
                    if (element.hasAttribute('multiple')) {
                        // @todo add multiple selection return
                        console.warn('Multiple selection not supported');
                    }
                    else {
                        return element.options[element.selectedIndex].value;
                    }
                    break;
            }
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

    this.setValueHashes_();
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
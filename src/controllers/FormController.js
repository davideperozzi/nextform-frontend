goog.provide('nextform.controllers.FormController');

// goog
goog.require('goog.dom');
goog.require('goog.asserts');
goog.require('goog.Promise');
goog.require('goog.structs.Map');
goog.require('goog.dom.dataset');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');

// nextform
goog.require('nextform.models.FormModel');
goog.require('nextform.models.ConfigModel');
goog.require('nextform.events.FormEvent');
goog.require('nextform.factories.FieldFactory');
goog.require('nextform.factories.ValidatorFactory');
goog.require('nextform.handlers.RequestHandler');
goog.require('nextform.handlers.UploadHandler');
goog.require('nextform.providers.FormProvider');
goog.require('nextform.models.fields.AbstractFieldModel');
goog.require('nextform.models.fields.CollectionFieldModel');
goog.require('nextform.handlers.error.TooltipErrorHandler');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
nextform.controllers.FormController = function()
{
    nextform.controllers.FormController.base(this, 'constructor');

    /**
     * @private
     * @type {nextform.models.FormModel}
     */
    this.form_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.sending_ = false;

    /**
     * @private
     * @type {nextform.models.ConfigModel}
     */
    this.config_ = new nextform.models.ConfigModel();

    /**
     * @private
     * @type {goog.events.EventHandler}
     */
    this.eventHandler_ = new goog.events.EventHandler(this);

    /**
     * @private
     * @type {Array<nextform.handlers.error.AbstractErrorHandler>}
     */
    this.errorHandlers_ = [
        new nextform.handlers.error.TooltipErrorHandler()
    ];

    /**
     * @private
     * @type {nextform.factories.FieldFactory}
     */
    this.fieldFactory_ = new nextform.factories.FieldFactory();

    /**
     * @private
     * @type {nextform.factories.ValidatorFactory}
     */
    this.validatorFactory_ = new nextform.factories.ValidatorFactory();

    /**
     * @private
     * @type {nextform.providers.FormProvider}
     */
    this.formProvider_ = new nextform.providers.FormProvider();

    /**
     * @private
     * @type {nextform.handlers.RequestHandler}
     */
    this.requestHandler_ = new nextform.handlers.RequestHandler();

    /**
     * @private
     * @type {nextform.handlers.UploadHandler}
     */
    this.uploadHandler_ = new nextform.handlers.UploadHandler();
};

goog.inherits(
    nextform.controllers.FormController,
    goog.events.EventTarget
);

/**
 * @public
 * @param {HTMLFormElement} element
 */
nextform.controllers.FormController.prototype.init = function(element)
{
    if (element.tagName.toLowerCase() != 'form') {
        throw new Error('Invalid form given');
    }

    // Create form
    this.form_ = new nextform.models.FormModel(/** @type {HTMLFormElement} */ (element));
    this.form_.fields.addAll(this.createFields_());

    // Parse form to provider
    this.formProvider_.parse(this.form_);

    // Init error handlers
    for (var i = 0, len = this.errorHandlers_.length; i < len; i++) {
        var handler = this.errorHandlers_[i];

        goog.asserts.assert(handler instanceof nextform.handlers.error.AbstractErrorHandler,
            'Error handler needs to be available and derived by the abstract error handler');

        handler.setForm(this.form_);
        handler.init();
    }

    // Attach listeners
    this.eventHandler_.listen(this.form_.element, goog.events.EventType.SUBMIT,
        this.handleFormSubmit_);

    this.eventHandler_.listen(this.uploadHandler_, [
        nextform.events.UploadEvent.EventType.START,
        nextform.events.UploadEvent.EventType.PROGRESS,
        nextform.events.UploadEvent.EventType.COMPLETE
    ], this.dispatchEvent);

    // Attach upload listeners if upload method matches
    if (this.formProvider_.hasFileField()) {
        this.addUploadChangeListeners_(
            this.formProvider_.getFileElements()
        );
    }
};

/**
 * @public
 * @param {nextform.handlers.error.AbstractErrorHandler} handler
 */
nextform.controllers.FormController.prototype.addErrorHandler = function(handler)
{
    this.errorHandlers_.push(handler);
};

/**
 * @public
 */
nextform.controllers.FormController.prototype.hideErrors = function()
{
    for (var i = 0, len = this.errorHandlers_.length; i < len; i++) {
        this.errorHandlers_[i].hide();
    }
};

/**
 * @public
 * @return {goog.Promise}
 */
nextform.controllers.FormController.prototype.submit = function()
{
    return this.submitForm_();
};


/**
 * @public
 * @return {string}
 */
nextform.controllers.FormController.prototype.getName = function()
{
    return this.formProvider_.getName();
};

/**
 * @return {HTMLFormElement}
 */
nextform.controllers.FormController.prototype.getElement = function()
{
    return this.form_.element;
};

/**
 * @public
 * @return {Array<Element>}
 */
nextform.controllers.FormController.prototype.getElements = function()
{
    return this.formProvider_.getFieldElements();
};

/**
 * @private
 * @return {goog.Promise}
 */
nextform.controllers.FormController.prototype.send_ = function()
{
    return new goog.Promise(function(resolve, reject){
        if (this.sending_) {
            reject(this.sending_)
            return;
        }

        this.dispatchEvent(new nextform.events.FormEvent(
            nextform.events.FormEvent.EventType.SEND
        ));

        this.sending_ = true;

        var result = this.validate_();

        if (result.valid) {
            this.dispatchEvent(new nextform.events.FormEvent(
                nextform.events.FormEvent.EventType.REQUEST
            ));

            this.requestHandler_.send(this.formProvider_).then(function(response){
                result = response.getResult();

                if (result.valid &&
                    this.formProvider_.hasFileField() &&
                    (this.config_.uploadMethod == nextform.models.ConfigModel.UploadMethod.ON_SUBMIT)) {
                    this.uploadHandler_.upload(this.formProvider_).then(function(uploadResponse){
                        this.handleResult_(uploadResponse.getResult());
                        this.sending_ = false;
                        resolve(result);
                    }, function(){
                        this.sending_ = false;
                    }, this);
                }
                else {
                    this.handleResult_(result);
                    this.sending_ = false;
                    resolve(result);
                }
            }, function(){
                this.sending_ = false;
            }, this);
        }
        else {
            this.handleResult_(result);
            this.sending_ = false;
            resolve(result);
        }
    }, this);
};

/**
 * @private
 * @return {nextform.models.ResultModel}
 */
nextform.controllers.FormController.prototype.validate_ = function()
{
    var result = new nextform.models.ResultModel();

    this.dispatchEvent(new nextform.events.FormEvent(
        nextform.events.FormEvent.EventType.VALIDATE
    ));

    this.form_.fields.forEach(function(field, name){
        var errors = this.validateField_(field);

        if ( ! errors.isEmpty()) {
            result.errors.set(name, errors.getValues());
        }
    }, this);

    result.valid = result.errors.isEmpty();

    return result;
};

/**
 * @private
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @return {goog.structs.Map<string, nextform.models.result.ErrorModel>}
 */
nextform.controllers.FormController.prototype.validateField_ = function(field)
{
    var errors = new goog.structs.Map();
    var value = this.formProvider_.getFieldValue(field);

    field.validators.forEach(function(validator, name){
        if ( ! validator.validate(value)) {
            var message = 'Invalid field';

            if (field.errors.containsKey(name)) {
                message = field.errors.get(name);
            }

            errors.set(name, new nextform.models.result.ErrorModel(message));
        }
    }, this);

    return errors;
};

/**
 * @private
 * @param {nextform.models.ResultModel} result
 */
nextform.controllers.FormController.prototype.handleResult_ = function(result)
{
    this.dispatchEvent(new nextform.events.FormEvent(
        nextform.events.FormEvent.EventType.RESULT,
        result
    ));

    if ( ! result.valid) {
        for (var i = 0, len = this.errorHandlers_.length; i < len; i++) {
            this.errorHandlers_[i].execute(result.errors);
        }
    }
};

/**
 * @private
 * @return {goog.Promise}
 */
nextform.controllers.FormController.prototype.submitForm_ = function()
{
    this.dispatchEvent(new nextform.events.FormEvent(
        nextform.events.FormEvent.EventType.SUBMIT
    ));

    return this.send_();
};

/**
 * @private
 * @param {goog.events.BrowserEvent} event
 */
nextform.controllers.FormController.prototype.handleFormSubmit_ = function(event)
{
    event.preventDefault();
    event.stopPropagation();

    this.submitForm_();
};

/**
 * @private
 * @param {goog.structs.Map<string, Array<Element>>} fields
 */
nextform.controllers.FormController.prototype.addUploadChangeListeners_ = function(fields)
{
    fields.forEach(function(elements){
        for (var i = 0, len = elements.length; i < len; i++) {
            this.eventHandler_.listen(elements[i], goog.events.EventType.CHANGE,
                this.handleUploadElementChange_);
        }
    }, this);
};

/**
 * @private
 * @param {goog.events.BrowserEvent} event
 */
nextform.controllers.FormController.prototype.handleUploadElementChange_ = function(event)
{
    var field = this.formProvider_.getFieldByElement(
        /** @type {Element} **/ (event.currentTarget)
    );

    var result = new nextform.models.ResultModel();
    var errors = this.validateField_(field);

    if ( ! errors.isEmpty()) {
        result.errors.set(field.name, errors.getValues());
    }

    result.valid = result.errors.isEmpty();

    if ( ! result.valid) {
        for (var i = 0, len = field.elements.length; i < len; i++) {
            field.elements[i].value = '';
        }
    }

    this.handleResult_(result);
};

/**
 * @private
 */
nextform.controllers.FormController.prototype.createFields_ = function()
{
    var formElements = this.form_.element.elements;
    var formFields = new goog.structs.Map();

    // Get default fields
    for (var name in formElements) {
        var items = formElements.namedItem(name);

        if (items) {
            formFields.set(name, this.fieldFactory_.createField(
                name,
                (goog.isArrayLike(items) && ! goog.dom.isElement(items))
                    ? goog.array.slice(/** @type {IArrayLike} */ (items), 0)
                    : [items]
            ));
        }
    }

    // Sort out collection fields
    var collectionFields = goog.dom.getElementsByTagName(
        new goog.dom.TagName('nextform-collection'), this.form_.element
    );

    for (var i = 0, len = collectionFields.length; i < len; i++) {
        var name = /** @type {string} */ (goog.dom.dataset.get(collectionFields[i], 'name'));
        var keys = formFields.getKeys();
        var fields = [];

        goog.array.forEach(keys, function(key){
            if (key == name || key.startsWith(name)) {
                fields.push(formFields.get(key));
                formFields.remove(key);
            }
        });

        var collectionField = new nextform.models.fields.CollectionFieldModel(
            name, collectionFields[i], fields
        );

        var types = [];

        for (var i1 = 0, len1 = fields.length; i1 < len1; i1++) {
            for (var i2 = 0, len2 = fields[i1].elements.length; i2 < len2; i2++) {
                types.push(fields[i1].elements[i2].getAttribute('type'));
            }
        }

        goog.array.removeDuplicates(types);

        if (types.length > 1) {
            throw new Error('Collection with different input types found');
        }

        collectionField.sharedType = types[0];

        formFields.set(name, collectionField);
    }

    formFields.forEach(function(field){
        this.validatorFactory_.createValidators(field);
    }, this);

    return formFields;
};
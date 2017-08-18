goog.provide('nextform.factories.ValidatorFactory');

// goog
goog.require('goog.array');
goog.require('goog.structs.Map');

// dj
goog.require('dj.ext.dom.attributes');

// nextform
goog.require('nextform.validators.AbstractValidator');
goog.require('nextform.validators.RequiredValidator');
goog.require('nextform.validators.FiletypeValidator');
goog.require('nextform.validators.ZipcodeValidator');
goog.require('nextform.validators.MaxlengthValidator');
goog.require('nextform.validators.MinlengthValidator');
goog.require('nextform.validators.MaxsizeValidator');

/**
 * @constructor
 */
nextform.factories.ValidatorFactory = function()
{
    /**
     * @private
     * @type {goog.structs.Map<string, Function>}
     */
    this.ctors_ = new goog.structs.Map({
        'required': nextform.validators.RequiredValidator,
        'zipcode': nextform.validators.ZipcodeValidator,
        'maxlength': nextform.validators.MaxlengthValidator,
        'minlength': nextform.validators.MinlengthValidator,
        'filetype': nextform.validators.FiletypeValidator,
        'maxsize': nextform.validators.MaxsizeValidator,
        'minsize': nextform.validators.MinsizeValidator
    });
};

/**
 * @const
 * @type {string}
 */
nextform.factories.ValidatorFactory.VALIDATOR_IDENTIFIER = 'data-validator-';

/**
 * @const
 * @type {string}
 */
nextform.factories.ValidatorFactory.ERROR_IDENTIFIER = 'data-error-';

/**
 * @public
 * @param {nextform.models.fields.AbstractFieldModel} field
 */
nextform.factories.ValidatorFactory.prototype.createValidators = function(field)
{
    for (var i = 0, len = field.elements.length; i < len; i++) {
        var validators = this.getValidators_(field, field.elements[i]);
        var errors = this.getErrors_(field, field.elements[i]);

        field.validators.addAll(validators);
        field.errors.addAll(errors);
    }

    for (var i1 = 0, len1 = field.fields.length; i1 < len1; i1++) {
        this.createValidators(field.fields[i1]);
    }
};

/**
 * @private
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {Element} element
 * @return {goog.structs.Map<string, nextform.validators.AbstractValidator>}
 */
nextform.factories.ValidatorFactory.prototype.getValidators_ = function(field, element)
{
    var validators = new goog.structs.Map();
    var attributes = dj.ext.dom.attributes.getAttributes(element);
    var identifier = nextform.factories.ValidatorFactory.VALIDATOR_IDENTIFIER;

    for (var name in attributes) {
        if ( ! name.startsWith(identifier)) {
            continue;
        }

        var validator = name.substr(identifier.length);
        var value = attributes[name];

        if ( ! this.ctors_.containsKey(validator)) {
            if (goog.DEBUG) {
                console.warn('Nextform-Validator "' + validator + '" not found.');
            }
        }
        else {
            var ctor = this.ctors_.get(validator);

            validators.set(validator, new ctor(field, value));
        }
    }

    return validators;
};


/**
 * @private
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {Element} element
 * @return {goog.structs.Map<string, nextform.validators.AbstractValidator>}
 */
nextform.factories.ValidatorFactory.prototype.getErrors_ = function(field, element)
{
    var errors = new goog.structs.Map();
    var attributes = dj.ext.dom.attributes.getAttributes(element);
    var identifier = nextform.factories.ValidatorFactory.ERROR_IDENTIFIER;

    for (var name in attributes) {
        if ( ! name.startsWith(identifier)) {
            continue;
        }

        var validator = name.substr(identifier.length);
        var value = attributes[name];

        errors.set(validator, value);
    }

    return errors;
};

/**
 * @private
 * @param {string} key
 * @return {string}
 */
nextform.factories.ValidatorFactory.prototype.capitalizeKey_ = function(key)
{
    return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
};
goog.provide('nextform.validators.RequiredValidator');

// nextform
goog.require('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @extends {nextform.validators.AbstractValidator}
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.RequiredValidator = function(field, optOption)
{
    nextform.validators.RequiredValidator.base(this, 'constructor', field, optOption);
};

goog.inherits(
    nextform.validators.RequiredValidator,
    nextform.validators.AbstractValidator
);

/** @inheritDoc */
nextform.validators.RequiredValidator.prototype.validate = function(value)
{
    if (goog.isArrayLike(value)) {
        return value.length > 0;
    }

    return value != null && value.trim().replace(/ |\t|\r|\r\n/, '') != '';
};
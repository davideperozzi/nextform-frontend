goog.provide('nextform.validators.MinsizeValidator');

// nextform
goog.require('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @extends {nextform.validators.AbstractValidator}
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.MinsizeValidator = function(field, optOption)
{
    nextform.validators.MinsizeValidator.base(this, 'constructor', field, optOption);
};

goog.inherits(
    nextform.validators.MinsizeValidator,
    nextform.validators.AbstractValidator
);

/** @inheritDoc */
nextform.validators.MinsizeValidator.prototype.validate = function(value)
{
    if (this.isFileValue(value)) {
        for (var i = 0, len = value.length; i < len; i++) {
            if (value[i].size / 1000 < parseFloat(this.option)) {
                return false;
            }
        }

        return true;
    }

    return true;
};
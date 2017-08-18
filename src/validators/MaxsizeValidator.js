goog.provide('nextform.validators.MaxsizeValidator');

// nextform
goog.require('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @extends {nextform.validators.AbstractValidator}
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.MaxsizeValidator = function(field, optOption)
{
    nextform.validators.MaxsizeValidator.base(this, 'constructor', field, optOption);
};

goog.inherits(
    nextform.validators.MaxsizeValidator,
    nextform.validators.AbstractValidator
);

/** @inheritDoc */
nextform.validators.MaxsizeValidator.prototype.validate = function(value)
{
    if (this.isFileValue(value)) {
        for (var i = 0, len = value.length; i < len; i++) {
            if (value[i].size / 1000 > parseFloat(this.option)) {
                return false;
            }
        }

        return true;
    }

    return true;
};
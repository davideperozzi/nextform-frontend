goog.provide('nextform.validators.MaxlengthValidator');

// avinia
goog.require('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @extends {nextform.validators.AbstractValidator}
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.MaxlengthValidator = function(field, optOption)
{
	nextform.validators.MaxlengthValidator.base(this, 'constructor', field, optOption);
};

goog.inherits(
	nextform.validators.MaxlengthValidator,
	nextform.validators.AbstractValidator
);

/** @inheritDoc */
nextform.validators.MaxlengthValidator.prototype.validate = function(value)
{
	var maxlength = parseInt(this.option, 10);

	if (typeof value == 'string' && !isNaN(maxlength)) {
		return value.length <= maxlength;
	}

	return false;
};
goog.provide('nextform.validators.MaxcountValidator');

// avinia
goog.require('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @extends {nextform.validators.AbstractValidator}
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.MaxcountValidator = function(field, optOption)
{
	nextform.validators.MaxcountValidator.base(this, 'constructor', field, optOption);
};

goog.inherits(
	nextform.validators.MaxcountValidator,
	nextform.validators.AbstractValidator
);

/** @inheritDoc */
nextform.validators.MaxcountValidator.prototype.validate = function(value)
{
	var maxlength = parseFloat(this.option);

    value = parseFloat(value);

	if ( ! isNaN(value) &&  ! isNaN(maxlength)) {
		return value <= maxlength;
	}

	return false;
};
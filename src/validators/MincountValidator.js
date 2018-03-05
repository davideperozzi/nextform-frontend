goog.provide('nextform.validators.MincountValidator');

// avinia
goog.require('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @extends {nextform.validators.AbstractValidator}
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.MincountValidator = function(field, optOption)
{
	nextform.validators.MincountValidator.base(this, 'constructor', field, optOption);
};

goog.inherits(
	nextform.validators.MincountValidator,
	nextform.validators.AbstractValidator
);

/** @inheritDoc */
nextform.validators.MincountValidator.prototype.validate = function(value)
{
	var maxlength = parseFloat(this.option);

    value = parseFloat(value);

	if ( ! isNaN(value) &&  ! isNaN(maxlength)) {
		return value >= maxlength;
	}

	return false;
};
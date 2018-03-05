goog.provide('nextform.validators.EmailValidator');

// avinia
goog.require('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @extends {nextform.validators.AbstractValidator}
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.EmailValidator = function(field, optOption)
{
	nextform.validators.EmailValidator.base(this, 'constructor', field, optOption);
};

goog.inherits(
	nextform.validators.EmailValidator,
	nextform.validators.AbstractValidator
);

/** @inheritDoc */
nextform.validators.EmailValidator.prototype.validate = function(value)
{
	var useValidator = parseInt(this.option, 10);

	if (typeof value == 'string' && 'false' !== useValidator) {
		return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
	}

	return false;
};
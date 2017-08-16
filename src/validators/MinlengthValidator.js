goog.provide('nextform.validators.MinlengthValidator');

// nextform
goog.require('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @extends {nextform.validators.AbstractValidator}
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.MinlengthValidator = function(field, optOption)
{
	nextform.validators.MinlengthValidator.base(this, 'constructor', field, optOption);
};

goog.inherits(
	nextform.validators.MinlengthValidator,
	nextform.validators.AbstractValidator
);

/** @inheritDoc */
nextform.validators.MinlengthValidator.prototype.validate = function(value)
{
	var minlength = parseInt(this.option, 10);

	if (typeof value == 'string' && !isNaN(minlength)) {
		return value.length >= minlength;
	}

	return false;
};
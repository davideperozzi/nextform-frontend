goog.provide('nextform.validators.ZipcodeValidator');

// nextform
goog.require('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @extends {nextform.validators.AbstractValidator}
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.ZipcodeValidator = function(field, optOption)
{
	nextform.validators.ZipcodeValidator.base(this, 'constructor', field, optOption);

	/**
	 * @private
	 * @type {Object}
	 */
	this.patterns_ = {
		'ar': new RegExp('^[B-T]{1}\d{4}[A-Z]{3}$', 'i'),
        'at': new RegExp('^[0-9]{4}$', 'i'),
        'au': new RegExp('^[0-9]{4}$', 'i'),
        'be': new RegExp('^[1-9][0-9]{3}$', 'i'),
        'ca': new RegExp('^[a-z][0-9][a-z][ \t-]*[0-9][a-z][0-9]$', 'i'),
        'ch': new RegExp('^[0-9]{4}$', 'i'),
        'cn': new RegExp('^[0-9]{6}$', ''),
        'de': new RegExp('^[0-9]{5}$', 'i'),
        'dk': new RegExp('^(DK-)?[0-9]{4}$', 'i'),
        'ee': new RegExp('^[0-9]{5}$', ''),
        'es': new RegExp('^[0-4][0-9]{4}$', ''),
        'fi': new RegExp('^(FI-)?[0-9]{5}$', 'i'),
        'fr': new RegExp('^(0[1-9]|[1-9][0-9])[0-9][0-9][0-9]$', 'i'),
        'in': new RegExp('^[1-9]{1}[0-9]{2}(\s|\-)?[0-9]{3}$', 'i'),
        'it': new RegExp('^[0-9]{5}$', ''),
        'is': new RegExp('^[0-9]{3}$', ''),
        'lv': new RegExp('^(LV-)?[1-9][0-9]{3}$', 'i'),
        'mx': new RegExp('^[0-9]{5}$', ''),
        'nl': new RegExp('^[0-9]{4}.?([a-z]{2})?$', 'i'),
        'no': new RegExp('^[0-9]{4}$', ''),
        'nz': new RegExp('^[0-9]{4}$', ''),
        'pl': new RegExp('^[0-9]{2}-[0-9]{3}$', ''),
        'pt': new RegExp('^[0-9]{4}-[0-9]{3}$', ''),
        'ru': new RegExp('^[0-9]{6}$', ''),
        'se': new RegExp('^[0-9]{3}\s?[0-9]{2}$', ''),
        'tr': new RegExp('^[0-9]{5}$', ''),
        'uk': new RegExp('^[a-z][a-z0-9]{1,3}\s?[0-9][a-z]{2}$', 'i'),
        'us': new RegExp('^[0-9]{5}((-| )[0-9]{4})?$', '')
	};
};

goog.inherits(
	nextform.validators.ZipcodeValidator,
	nextform.validators.AbstractValidator
);

/** @inheritDoc */
nextform.validators.ZipcodeValidator.prototype.validate = function(value)
{
    return this.option && this.patterns_.hasOwnProperty(this.option) && this.patterns_[this.option].test(value);
};
goog.provide('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.AbstractValidator = function(field, optOption)
{
    /**
     * @protected
     * @type {nextform.models.fields.AbstractFieldModel}
     */
    this.field = field;

    /**
     * @protected
     * @type {string}
     */
    this.option = optOption || '';
};

/**
 * @public
 * @param {*} value
 * @return {boolean}
 */
nextform.validators.AbstractValidator.prototype.validate = function(value)
{
    return goog.abstractMethod();
};

/**
 * @protected
 * @return {boolean}
 */
nextform.validators.AbstractValidator.prototype.isFileValue = function(value)
{
    return window.hasOwnProperty('FileList') && value instanceof FileList;
};
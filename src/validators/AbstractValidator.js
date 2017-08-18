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
 * @param {*} value
 * @return {boolean}
 */
nextform.validators.AbstractValidator.prototype.isFileValue = function(value)
{
    var isFileList = (window.hasOwnProperty('FileList') && value instanceof FileList);
    var isFileArray = goog.isArray(value) && window.hasOwnProperty('File');

    if (isFileArray) {
        goog.array.forEach(/** @type {IArrayLike} */ (value), function(file){
            if ( ! (file instanceof File)) {
                isFileArray = false;
            }
        });
    }

    return isFileList || isFileArray;
};
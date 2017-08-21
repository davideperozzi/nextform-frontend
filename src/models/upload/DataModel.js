goog.provide('nextform.models.upload.DataModel');

/**
 * @struct
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {FormData} data
 * @constructor
 */
nextform.models.upload.DataModel = function(field, data)
{
    /**
     * @public
     * @type {nextform.models.fields.AbstractFieldModel}
     */
    this.field = field;

    /**
     * @public
     * @type {FormData}
     */
    this.data = data;

    /**
     * @public
     * @type {boolean}
     */
    this.hasFiles = false;

    /**
     * @public
     * @type {Object}
     */
    this.response = {};
};
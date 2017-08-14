goog.provide('nextform.models.FormularModel');

/**
 * @struct
 * @constructor
 * @param {HTMLFormElement} element
 */
nextform.models.FormularModel = function(element)
{
    /**
     * @private
     * @type {HTMLFormElement}
     */
    this.element = element;

    /**
     * @public
     * @type {goog.structs.Map<string, Array<nextform.models.fields.AbstractFieldModel>>}
     */
    this.fields = new goog.structs.Map();
};
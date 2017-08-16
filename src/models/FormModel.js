goog.provide('nextform.models.FormModel');

/**
 * @struct
 * @constructor
 * @param {HTMLFormElement} element
 */
nextform.models.FormModel = function(element)
{
    /**
     * @public
     * @type {HTMLFormElement}
     */
    this.element = element;

    /**
     * @public
     * @type {goog.structs.Map<string, nextform.models.fields.AbstractFieldModel>}
     */
    this.fields = new goog.structs.Map();
};
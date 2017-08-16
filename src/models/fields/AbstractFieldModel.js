goog.provide('nextform.models.fields.AbstractFieldModel');

// goog
goog.require('goog.structs.Map');

/**
 * @struct
 * @constructor
 * @param {string} name
 * @param {Array<Element>=} optElements
 * @param {Array<nextform.models.fields.AbstractFieldModel>=} optFields
 */
nextform.models.fields.AbstractFieldModel = function(name, optElements, optFields)
{
    /**
     * @public
     * @type {string}
     */
    this.name = name;

    /**
     * @public
     * @type {Array<Element>}
     */
    this.elements = optElements || [];

    /**
     * @public
     * @type {Array<nextform.models.fields.AbstractFieldModel>}
     */
    this.fields = optFields || [];

    /**
     * @public
     * @type {goog.structs.Map<string, nextform.validators.AbstractValidator>}
     */
    this.validators = new goog.structs.Map();

    /**
     * @public
     * @type {goog.structs.Map<string, string>}
     */
    this.errors = new goog.structs.Map();

    /**
     * @public
     * @type {Element}
     */
    this.errorTarget = null;
};
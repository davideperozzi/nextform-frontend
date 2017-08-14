goog.provide('nextform.models.fields.SelectFieldModel');

// nextform
goog.require('nextform.models.fields.AbstractFieldModel');

/**
 * @struct
 * @constructor
 * @param {string} name
 * @param {Array<Element>} elements
 * @extends {nextform.models.fields.AbstractFieldModel}
 */
nextform.models.fields.SelectFieldModel = function(name, elements)
{
    nextform.models.fields.SelectFieldModel.base(this, 'constructor', name, elements);
};

goog.inherits(
    nextform.models.fields.SelectFieldModel,
    nextform.models.fields.AbstractFieldModel
);
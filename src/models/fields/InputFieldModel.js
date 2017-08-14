goog.provide('nextform.models.fields.InputFieldModel');

// nextform
goog.require('nextform.models.fields.AbstractFieldModel');

/**
 * @struct
 * @constructor
 * @param {string} name
 * @param {Array<Element>} elements
 * @extends {nextform.models.fields.AbstractFieldModel}
 */
nextform.models.fields.InputFieldModel = function(name, elements)
{
    nextform.models.fields.InputFieldModel.base(this, 'constructor', name, elements);
};

goog.inherits(
    nextform.models.fields.InputFieldModel,
    nextform.models.fields.AbstractFieldModel
);
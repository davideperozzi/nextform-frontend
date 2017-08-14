goog.provide('nextform.models.fields.TextareaFieldModel');

// nextform
goog.require('nextform.models.fields.AbstractFieldModel');

/**
 * @struct
 * @constructor
 * @param {string} name
 * @param {Array<Element>} elements
 * @extends {nextform.models.fields.AbstractFieldModel}
 */
nextform.models.fields.TextareaFieldModel = function(name, elements)
{
    nextform.models.fields.TextareaFieldModel.base(this, 'constructor', name, elements);
};

goog.inherits(
    nextform.models.fields.TextareaFieldModel,
    nextform.models.fields.AbstractFieldModel
);
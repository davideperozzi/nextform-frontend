goog.provide('nextform.models.fields.CollectionFieldModel');

// nextform
goog.require('nextform.models.fields.AbstractFieldModel');

/**
 * @struct
 * @constructor
 * @param {string} name
 * @param {Element} element
 * @param {Array<nextform.models.fields.AbstractFieldModel>} fields
 * @extends {nextform.models.fields.AbstractFieldModel}
 */
nextform.models.fields.CollectionFieldModel = function(name, element, fields)
{
    nextform.models.fields.CollectionFieldModel.base(this, 'constructor', name, [element], fields);

    /**
     * @public
     * @type {string}
     */
    this.sharedType = '';
};

goog.inherits(
    nextform.models.fields.CollectionFieldModel,
    nextform.models.fields.AbstractFieldModel
);
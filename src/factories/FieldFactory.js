goog.provide('nextform.factories.FieldFactory');

// goog
goog.require('goog.asserts');
goog.require('goog.structs.Map');

// nextform
goog.require('nextform.models.fields.InputFieldModel');
goog.require('nextform.models.fields.SelectFieldModel');
goog.require('nextform.models.fields.TextareaFieldModel');

/**
 * @constructor
 */
nextform.factories.FieldFactory = function()
{
    /**
     * @private
     * @type {goog.structs.Map<string, Function>}
     */
    this.ctors_ = new goog.structs.Map({
        'input': nextform.models.fields.InputFieldModel,
        'select': nextform.models.fields.SelectFieldModel,
        'textarea': nextform.models.fields.TextareaFieldModel
    });
};

/**
 * @public
 * @param {string} name
 * @param {Array<Element>} elements
 * @return {nextform.models.fields.AbstractFieldModel}
 */
nextform.factories.FieldFactory.prototype.createField = function(name, elements)
{
    var tags = [];

    for (var i = 0, len = elements.length; i < len; i++) {
        var tagName = elements[i].tagName.toLowerCase();

        if (tags.length != 0 && tags.indexOf(tagName) === -1) {
            throw new Error('Can\'t create field with different input types');
        }

        tags.push(tagName);
    }

    if (tags.length < 1) {
        throw new Error('Not enough input elements provided to create a field');
    }

    if ( ! this.ctors_.containsKey(tags[0])) {
        throw new Error('Field constructor with name "' + tags[0] + '" not founds');
    }

    var ctor = this.ctors_.get(tags[0]);
    var field = new ctor(name, elements);

    for (var i = 0, len = elements.length; i < len; i++) {
        if (goog.dom.dataset.has(elements[i], 'errorTarget')) {
            var targetClass = /** @type {string} */ (goog.dom.dataset.get(elements[i], 'errorTarget'));
            var targetElement = goog.dom.getAncestorByClass(elements[i], targetClass);

            field.errorTarget = targetElement;
            break;
        }
    }

    // console.log(elements);

    return field;
};
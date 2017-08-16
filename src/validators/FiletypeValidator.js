goog.provide('nextform.validators.FiletypeValidator');

// nextform
goog.require('nextform.validators.AbstractValidator');

/**
 * @constructor
 * @extends {nextform.validators.AbstractValidator}
 * @param {nextform.models.fields.AbstractFieldModel} field
 * @param {string=} optOption
 */
nextform.validators.FiletypeValidator = function(field, optOption)
{
    nextform.validators.FiletypeValidator.base(this, 'constructor', field, optOption);
};

goog.inherits(
    nextform.validators.FiletypeValidator,
    nextform.validators.AbstractValidator
);

/** @inheritDoc */
nextform.validators.FiletypeValidator.prototype.validate = function(value)
{
    if (this.isFileValue(value)) {
        var allowedExtensions = this.option.split(',');
        var validExtensions = 0;

        value = /** @type {Array<File>} **/ (goog.array.slice(
            /** @type {IArrayLike} */ (value), 0
        ));

        goog.array.forEach(value, function(file){
            var foundExtensions = 0;

            for (var i = 0, len = allowedExtensions.length; i < len; i++) {
                var possibleExtension = file.name.substr(-allowedExtensions[i].length);

                if (possibleExtension.toLowerCase() == allowedExtensions[i].toLowerCase()) {
                    foundExtensions++;
                }
            }

            if (foundExtensions > 0) {
                validExtensions++;
            }
        });

        return validExtensions == value.length;
    }

    return true;
};
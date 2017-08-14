goog.provide('nextform.models.ResultModel');

// nextform
goog.require('nextform.models.result.ErrorModel');

/**
 * @struct
 * @constructor
 */
nextform.models.ResultModel = function()
{
    /**
     * @public
     * @type {boolean}
     */
    this.valid = true;

    /**
     * @public
     * @type {boolean}
     */
    this.session = false;

    /**
     * @public
     * @type {goog.structs.Map<string, Array<nextform.models.result.ErrorModel>>}
     */
    this.errors = new goog.structs.Map();
};
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

    /**
     * @public
     * @type {number}
     */
    this.errorCode = nextform.models.ResultModel.ErrorCode.NO_ERROR;

    /**
     * @public
     * @type {string}
     */
    this.errorMessage = '';
};

/**
 * @enum {string}
 */
nextform.models.ResultModel.ErrorCode = {
    NO_ERROR: 0,
    UNKNOWN: 1,
    CUSTOM_ERROR: 2,
    INVALID_RESPONSE: 3
};

/**
 * @enum {string}
 */
nextform.models.ResultModel.ErrorMessage = {
    UNKNOWN: 'Something went wrong',
    INVALID_RESPONSE: 'Invalid response',
};
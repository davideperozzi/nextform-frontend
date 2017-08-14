goog.provide('nextform.models.ConfigModel');

/**
 * @struct
 * @constructor
 */
nextform.models.ConfigModel = function()
{
    /**
     * @public
     * @type {number}
     */
    this.uploadMethod = nextform.models.ConfigModel.UploadMethod.ON_SUBMIT;
};

/**
 * @enum {number}
 */
nextform.models.ConfigModel.UploadMethod = {
    ON_SUBMIT: 1,
    ON_CHANGE: 2
};
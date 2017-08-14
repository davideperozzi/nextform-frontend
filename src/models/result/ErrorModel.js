goog.provide('nextform.models.result.ErrorModel');

/**
 * @struct
 * @constructor
 * @param {string} message
 */
nextform.models.result.ErrorModel = function(message)
{
    /**
     * @public
     * @type {string}
     */
    this.message = message;
};
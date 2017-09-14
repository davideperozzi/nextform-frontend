goog.provide('nextform.models.CsrfTokenModel');

/**
 * @struct
 * @constructor
 * @param {string} id
 * @param {string} value
 */
nextform.models.CsrfTokenModel = function(id, value)
{
    /**
     * @public
     * @type {string}
     */
    this.id = id;

    /**
     * @public
     * @type {string}
     */
    this.value = value;
};
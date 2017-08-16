goog.provide('nextform.handlers.error.AbstractErrorHandler');

// goog
goog.require('goog.asserts');
goog.require('goog.structs.Map');

/**
 * @constructor
 * @param {Object|goog.structs.Map<string, string|number>=} optDefaultconfig
 */
nextform.handlers.error.AbstractErrorHandler = function(optDefaultconfig)
{
    /**
     * @protected
     * @type {nextform.models.FormModel}
     */
    this.form = null;

    /**
     * @protected
     * @type {goog.structs.Map<string, string|number>}
     */
    this.config = new goog.structs.Map(optDefaultconfig || {});
};

/**
 * @public
 */
nextform.handlers.error.AbstractErrorHandler.prototype.init = function()
{
    goog.asserts.assert(this.form != null, 'Error handler needs a form');
};

/**
 * @public
 * @param {goog.structs.Map<string, Array<nextform.models.result.ErrorModel>>} errors
 */
nextform.handlers.error.AbstractErrorHandler.prototype.execute = function(errors)
{
    goog.abstractMethod();
};

/**
 * @public
 */
nextform.handlers.error.AbstractErrorHandler.prototype.hide = function()
{

};

/**
 * @public
 * @param {nextform.models.FormModel} form
 */
nextform.handlers.error.AbstractErrorHandler.prototype.setForm = function(form)
{
    this.form = form;
};

/**
 * @public
 * @param {string} name
 * @param {string|number} value
 */
nextform.handlers.error.AbstractErrorHandler.prototype.setConfig = function(name, value)
{
    this.config.set(name, value);
};
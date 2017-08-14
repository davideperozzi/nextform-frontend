goog.provide('nextform.handlers.error.AbstractErrorHandler');

// goog
goog.require('goog.asserts');
goog.require('goog.structs.Map');

/**
 * @construct
 * @param {Object|goog.structs.Map<string, string|number>=} optDefaultconfig
 */
nextform.handlers.error.AbstractErrorHandler = function(optDefaultconfig)
{
    /**
     * @protected
     * @type {nextform.models.FormularModel}
     */
    this.formular = null;

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
    goog.asserts.assert(this.formular != null, 'Error handler needs a formular');
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
 * @param {nextform.models.FormularModel} formular
 */
nextform.handlers.error.AbstractErrorHandler.prototype.setFormular = function(formular)
{
    this.formular = formular;
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
goog.provide('nextform.components.AbastractFieldComponent');

// nextform
goog.require('dj.sys.components.AbstractComponent');

/**
 * @constructor
 * @extends {dj.sys.components.AbstractComponent}
 */
nextform.components.AbastractFieldComponent = function()
{
    nextform.components.AbastractFieldComponent.base(this, 'constructor');
};

goog.inherits(
    nextform.components.AbastractFieldComponent,
    dj.sys.components.AbstractComponent
);

/**
 * @public
 * @return {*}
 */
nextform.components.AbastractFieldComponent.prototype.getValue = function()
{
    return goog.abstractMethod();
};
goog.provide('nextform.providers.TooltipProvider');

// goog
goog.require('goog.positioning.Corner');
goog.require('goog.positioning.AnchoredPosition');

// nextform
goog.require('nextform.ui.TooltipElement');

/**
 * @constructor
 */
nextform.providers.TooltipProvider = function()
{
    /**
     * @private
     * @type {nextform.ui.TooltipElement}
     */
    this.tooltip_ = new nextform.ui.TooltipElement();
};

/**
 * @public
 * @param {Element} parent
 */
nextform.providers.TooltipProvider.prototype.init = function(parent)
{
    this.tooltip_.init(parent);
};

/**
 * @public
 * @param {Element} element
 * @param {string} message
 */
nextform.providers.TooltipProvider.prototype.show = function(element, message)
{
    var elementSize = goog.style.getSize(element);

    this.tooltip_.setContent(message).then(function(){
        this.tooltip_.setPosition(
            new goog.positioning.AnchoredPosition(
                element, goog.positioning.Corner.BOTTOM_START
            )
        );

        this.tooltip_.setSize(elementSize.width);
        this.tooltip_.show();
    }, null, this);
};

/**
 * @public
 */
nextform.providers.TooltipProvider.prototype.hide = function()
{
    this.tooltip_.hide();
};

/**
 * @public
 */
nextform.providers.TooltipProvider.prototype.update = function()
{
    this.tooltip_.update();
};

/**
 * @public
 * @return {Element}
 */
nextform.providers.TooltipProvider.prototype.getElement = function()
{
    return this.tooltip_.getElement();
};
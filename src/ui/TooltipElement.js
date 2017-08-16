goog.provide('nextform.ui.TooltipElement');

// goog
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.Promise');
goog.require('goog.ui.Popup');
goog.require('goog.math.Size');
goog.require('goog.async.nextTick');
goog.require('goog.positioning.Corner');

/**
 * @constructor
 */
nextform.ui.TooltipElement = function()
{
    /**
     * @private
     * @type {goog.positioning.AbstractPosition}
     */
    this.position_ = null;

    /**
     * @private
     * @type {Element}
     */
    this.tooltipElement_ = null;

    /**
     * @private
     * @type {Element}
     */
    this.contentElement_ = null;

    /**
     * @private
     * @type {goog.math.Size};
     */
    this.minSize_ = new goog.math.Size(0, 0);
};

/**
 * @const
 * @type {string}
 */
nextform.ui.TooltipElement.WRAPPER_CLASS = 'nextform-tooltip';

/**
 * @const
 * @type {string}
 */
nextform.ui.TooltipElement.CONTAINER_CLASS = 'nextform-tooltip--container';

/**
 * @const
 * @type {string}
 */
nextform.ui.TooltipElement.CONTENT_CLASS = 'nextform-tooltip--content';

/**
 * @public
 * @param {Element} parent
 */
nextform.ui.TooltipElement.prototype.init = function(parent)
{
    var domHelper = goog.dom.getDomHelper();

    this.tooltipElement_ = domHelper.createDom('div', nextform.ui.TooltipElement.WRAPPER_CLASS, [
        domHelper.createDom('div', nextform.ui.TooltipElement.CONTAINER_CLASS, [
            this.contentElement_ = domHelper.createDom('span', nextform.ui.TooltipElement.CONTENT_CLASS)
        ])
    ]);

    goog.dom.appendChild(parent,  this.tooltipElement_);

    goog.async.nextTick(function(){
        this.updateMinSize_();
    }, this);
};

/**
 * @public
 * @param {string} content
 */
nextform.ui.TooltipElement.prototype.setContent = function(content)
{
    goog.dom.setTextContent(this.contentElement_, content);

    return new goog.Promise(function(resolve, reject){
        goog.async.nextTick(function(){
            this.updateMinSize_();

            goog.async.nextTick(function(){
                goog.style.setSize(this.tooltipElement_, this.minSize_);
                resolve();
            }, this);
        }, this);
    }, this)
};

/**
 * @public
 * @param {number} width
 * @param {number=} optHeight
 */
nextform.ui.TooltipElement.prototype.setSize = function(width, optHeight)
{
    if (width > this.minSize_.width) {
        goog.style.setWidth(this.tooltipElement_, width);
    }

    if (optHeight && optHeight > this.minSize_.height) {
        goog.style.setHeight(this.tooltipElement_, optHeight);
    }
};

/**
 * @public
 * @param {goog.positioning.AbstractPosition} position
 */
nextform.ui.TooltipElement.prototype.setPosition = function(position)
{
    this.position_ = position;
    this.reposition_();

    goog.async.nextTick(function(){
        setTimeout(function(){
            goog.dom.classlist.enable(this.tooltipElement_, 'ready', true);
        }.bind(this), 50);
    }, this);
};

/**
 * @public
 */
nextform.ui.TooltipElement.prototype.show = function()
{
    goog.dom.classlist.enable(this.tooltipElement_, 'visible', true);
};

/**
 * @public
 */
nextform.ui.TooltipElement.prototype.hide = function()
{
    goog.dom.classlist.enable(this.tooltipElement_, 'visible', false);
    goog.dom.classlist.enable(this.tooltipElement_, 'ready', false);
};

/**
 * @public
 */
nextform.ui.TooltipElement.prototype.update = function()
{
    this.reposition_();
    this.updateMinSize_();
};

/**
 * @public
 * @return {Element}
 */
nextform.ui.TooltipElement.prototype.getElement = function()
{
    return this.tooltipElement_;
};


/**
 * @private
 */
nextform.ui.TooltipElement.prototype.reposition_ = function()
{
    if (this.position_) {
        this.position_.reposition(this.tooltipElement_,
            this.position_.corner || goog.positioning.Corner.BOTTOM_START);
    }
};

/**
 * @private
 */
nextform.ui.TooltipElement.prototype.updateMinSize_ = function()
{
    this.minSize_ = goog.style.getSize(this.contentElement_);
};
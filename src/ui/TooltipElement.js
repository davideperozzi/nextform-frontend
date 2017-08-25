goog.provide('nextform.ui.TooltipElement');

// goog
goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.Promise');
goog.require('goog.ui.Popup');
goog.require('goog.math.Size');
goog.require('goog.async.nextTick');
goog.require('goog.positioning.Corner');

// dj
goog.require('dj.ext.providers.ResizeProvider');

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
     * @type {goog.math.Size}
     */
    this.size_ = new goog.math.Size(0, 0);

    /**
     * @private
     * @type {goog.math.Size};
     */
    this.minSize_ = new goog.math.Size(0, 0);

    /**
     * @private
     * @type {boolean}
     */
    this.visible_ = false;

    /**
     * @private
     * @type {dj.ext.providers.ResizeProvider}
     */
    this.resizeProvider_ = dj.ext.providers.ResizeProvider.getInstance();

    /**
     * @private
     * @type {number}
     */
    this.pulseTimeout_ = -1;

    /**
     * @private
     * @type {number}
     */
    this.pulseTimeMs_ = 0;
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
    this.resizeProvider_.init();

    var domHelper = goog.dom.getDomHelper();

    this.tooltipElement_ = domHelper.createDom('div', nextform.ui.TooltipElement.WRAPPER_CLASS, [
        domHelper.createDom('div', nextform.ui.TooltipElement.CONTAINER_CLASS, [
            this.contentElement_ = domHelper.createDom('span', nextform.ui.TooltipElement.CONTENT_CLASS)
        ])
    ]);

    goog.dom.appendChild(parent,  this.tooltipElement_);

    goog.async.nextTick(function(){
        this.updateMinSize_();

        goog.events.listen(this.resizeProvider_, dj.ext.providers.ResizeProvider.EventType.RESIZE,
            this.handleResize_, false, this);
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
    if (this.visible_ && this.pulseTimeMs_ > 0) {
        goog.dom.classlist.enable(this.tooltipElement_, 'pulse', true);

        clearTimeout(this.pulseTimeout_);
        this.pulseTimeout_ = setTimeout(function(){
            goog.dom.classlist.enable(this.tooltipElement_, 'pulse', false);
        }.bind(this), this.pulseTimeMs_);
    }

    this.visible_ = true;
    goog.dom.classlist.enable(this.tooltipElement_, 'visible', true);

};

/**
 * @public
 */
nextform.ui.TooltipElement.prototype.hide = function()
{
    this.visible_ = false;
    goog.dom.classlist.enable(this.tooltipElement_, 'visible', false);
    goog.dom.classlist.enable(this.tooltipElement_, 'ready', false);
};

/**
 * @public
 * @param {number} ms
 */
nextform.ui.TooltipElement.prototype.setPulseTime = function(ms)
{
    this.pulseTimeMs_ = ms;
};

/**
 * @public
 */
nextform.ui.TooltipElement.prototype.update = function()
{
    this.reposition_();
    this.updateMinSize_();
    this.updateSize_();
};

/**
 * @public
 * @return {boolean}
 */
nextform.ui.TooltipElement.prototype.isVisible = function()
{
    return this.visible_;
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
nextform.ui.TooltipElement.prototype.handleResize_ = function()
{
    this.updateSize_();
};

/**
 * @private
 */
nextform.ui.TooltipElement.prototype.reposition_ = function()
{
    if (this.position_) {
        this.position_.reposition(this.tooltipElement_, goog.positioning.Corner.TOP_LEFT);

        goog.async.nextTick(function(){
            var clientPos = goog.style.getClientPosition(this.tooltipElement_);
            var windowSize = this.resizeProvider_.getWindowSize();
            var dockingTop = clientPos.y <= 0;
            var dockingBottom = clientPos.y >= windowSize.height - this.size_.height;

            goog.dom.classlist.enable(this.tooltipElement_, 'docking', dockingTop || dockingBottom);
            goog.dom.classlist.enable(this.tooltipElement_, 'docking-top', dockingTop);
            goog.dom.classlist.enable(this.tooltipElement_, 'docking-bottom', dockingBottom);
        }, this);
    }
};

/**
 * @private
 */
nextform.ui.TooltipElement.prototype.updateMinSize_ = function()
{
    this.minSize_ = goog.style.getSize(this.contentElement_);
};

/**
 * @private
 */
nextform.ui.TooltipElement.prototype.updateSize_ = function()
{
    this.size_ = goog.style.getSize(this.tooltipElement_);
};
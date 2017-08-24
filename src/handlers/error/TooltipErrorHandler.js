goog.provide('nextform.handlers.error.TooltipErrorHandler');

// goog
goog.require('goog.events.EventHandler');
goog.require('goog.dom.animationFrame');

// dj
goog.require('dj.ext.providers.ResizeProvider');
goog.require('dj.ext.providers.ScrollProvider');

// nextform
goog.require('nextform.providers.TooltipProvider');
goog.require('nextform.models.fields.CollectionFieldModel');
goog.require('nextform.handlers.error.AbstractErrorHandler');

/**
 * @constructor
 * @extends {nextform.handlers.error.AbstractErrorHandler}
 */
nextform.handlers.error.TooltipErrorHandler = function()
{
    nextform.handlers.error.TooltipErrorHandler.base(this, 'constructor', {
        'showAll': false,
        'autoHide': true,
        'hideOnScroll': false,
        'hideOnResize': false,
        'updateWithRaf': true,
        'pulseTimeMs': 250,
        'autoHideMs': 5000,
        'hideOnClick': true,
        'observeParentContainers': true,
        'hideOnInteraction': true
    });

    /**
     * @private
     * @type {nextform.providers.TooltipProvider}
     */
    this.tooltip_ = new nextform.providers.TooltipProvider();

    /**
     * @private
     * @type {goog.events.EventHandler}
     */
    this.elementHandler_ = new goog.events.EventHandler(this);

    /**
     * @private
     * @type {dj.ext.providers.ResizeProvider}
     */
    this.resizeProvider_ = dj.ext.providers.ResizeProvider.getInstance();

    /**
     * @private
     * @type {dj.ext.providers.ScrollProvider}
     */
    this.scrollProvider_ = dj.ext.providers.ScrollProvider.getInstance();

    /**
     * @private
     * @type {number}
     */
    this.hideTimeout_ = -1;

    /**
     * @private
     * @type {boolean}
     */
    this.hideOnScroll_ = false;

    /**
     * @private
     * @type {boolean}
     */
    this.hideOnResize_ = false;

    /**
     * @private
     * @type {boolean}
     */
    this.updateWithRaf_ = false;

    /**
     * @private
     * @type {boolean}
     */
    this.observeParentContainers_ = false;

    /**
     * @private
     * @type {Array<Element>}
     */
    this.scrollableContainers_ = [];

    /**
     * @private
     * @type {function(...?)}
     */
    this.updateAnimationTask_ = null;

    /**
     * @private
     * @type {boolean}
     */
    this.animationTaskTicking_ = false;
};

goog.inherits(
    nextform.handlers.error.TooltipErrorHandler,
    nextform.handlers.error.AbstractErrorHandler
);

/** @inheritDoc */
nextform.handlers.error.TooltipErrorHandler.prototype.init = function()
{
    nextform.handlers.error.TooltipErrorHandler.base(this, 'init');

    this.tooltip_.init(/** @type {Element} */ (document.documentElement));
    this.tooltip_.setPulseTime(this.config.get('pulseTimeMs') || 0);

    this.resizeProvider_.init();
    this.scrollProvider_.init();

    this.hideOnScroll_ = !!this.config.get('hideOnScroll');
    this.hideOnResize_ = !!this.config.get('hideOnResize');
    this.updateWithRaf_ = !!this.config.get('updateWithRaf');
    this.observeParentContainers_ = !!this.config.get('observeParentContainers');

    if ( ! this.updateWithRaf_) {
        goog.events.listen(this.resizeProvider_, dj.ext.providers.ResizeProvider.EventType.RESIZE,
            this.handleResize_, false, this);

        goog.events.listen(this.scrollProvider_, dj.ext.providers.ScrollProvider.EventType.SCROLL,
            this.handleScroll_, false, this);

        if (this.observeParentContainers_) {
            this.updateScrollableContainers_();
        }
    }
    else {
        this.updateAnimationTask_ =  goog.dom.animationFrame.createTask({
            measure: function(state) {
                if (this.tooltip_.isVisible()) {
                    this.animationTaskTicking_ = true;
                    this.updateAnimationTask_();
                }
                else {
                    this.animationTaskTicking_ = false;
                }
            },
            mutate: function(state) {
                this.tooltip_.update();
            }
        }, this);
    }
};

/** @inheritDoc */
nextform.handlers.error.TooltipErrorHandler.prototype.execute = function(errors)
{
    if (errors.isEmpty()) {
        return;
    }

    if (this.config.get('showAll')) {
        throw new Error('Currently only stepped tooltips are supported');
    }

    this.elementHandler_.removeAll();
    clearTimeout(this.hideTimeout_);

    var names = errors.getKeys();
    var nextName = names[0];
    var nextError = errors.get(nextName);

    if (this.form.fields.containsKey(nextName)) {
        var nextField = this.form.fields.get(nextName);

        this.show(nextField.errorTarget || nextField.elements[0], nextError[0].message);

        if (this.config.get('hideOnClick')) {
            this.elementHandler_.listenOnce(this.tooltip_.getElement(),
                goog.events.EventType.CLICK, this.hide);
        }

        if (this.config.get('hideOnInteraction')) {
            if (nextField.errorTarget) {
                this.elementHandler_.listenOnce(nextField.errorTarget, [
                    goog.events.EventType.CLICK, goog.events.EventType.FOCUS
                ], this.hide);
            }

            if (nextField instanceof nextform.models.fields.CollectionFieldModel) {
                for (var i = 0, len = nextField.fields.length; i < len; i++) {
                    var fieldElements = nextField.fields[i].elements;

                    for (var i1 = 0, len1 = fieldElements.length; i1 < len1; i1++) {
                        this.elementHandler_.listenOnce(fieldElements[i1], [
                            goog.events.EventType.CLICK, goog.events.EventType.FOCUS
                        ], this.hide);
                    }
                }
            }
            else {
                for (var i = 0, len = nextField.elements.length; i < len; i++) {
                    this.elementHandler_.listenOnce(nextField.elements[i], [
                        goog.events.EventType.CLICK, goog.events.EventType.FOCUS
                    ], this.hide);
                }
            }
        }

        if (this.config.get('autoHide')) {
            this.hideTimeout_ = setTimeout(function(){
                this.hide();
            }.bind(this), this.config.get('autoHideMs') || 5000);
        }
    }
};

/**
 * @public
 * @param {Element} element
 * @param {string} message
 */
nextform.handlers.error.TooltipErrorHandler.prototype.show = function(element, message)
{
    if (this.updateAnimationTask_ && ! this.animationTaskTicking_) {
        this.updateAnimationTask_();
    }

    this.tooltip_.show(element, message);
};

/**
 * @public
 */
nextform.handlers.error.TooltipErrorHandler.prototype.hide = function()
{
    this.tooltip_.hide();
};

/**
 * @private
 */
nextform.handlers.error.TooltipErrorHandler.prototype.handleResize_ = function()
{
    if (this.observeParentContainers_) {
        this.updateScrollableContainers_();
    }

    goog.async.nextTick(function(){
        if (this.hideOnScroll_) {
            this.tooltip_.hide();
        }
        else {
            this.tooltip_.update();
        }
    }, this);
};

/**
 * @private
 */
nextform.handlers.error.TooltipErrorHandler.prototype.handleScroll_ = function()
{
    if (this.hideOnScroll_) {
        this.tooltip_.hide();
    }
    else {
        this.tooltip_.update();
    }
};

/**
 * @private
 */
nextform.handlers.error.TooltipErrorHandler.prototype.updateScrollableContainers_ = function()
{
    var containers = this.getScrollableContainers_();

    goog.array.forEach(this.scrollableContainers_, function(element){
        if (goog.array.contains(containers, element)) {
            goog.events.unlisten(element, goog.events.EventType.SCROLL,
                this.handleScroll_, false, this);
        }
    });

    goog.array.forEach(containers, function(element){
        if ( ! goog.array.contains(this.scrollableContainers_, element)) {
            goog.events.listen(element, goog.events.EventType.SCROLL,
                this.handleScroll_, false, this);
        }
    }, this);
};

/**
 * @private
 * @return {Array<Element>}
 */
nextform.handlers.error.TooltipErrorHandler.prototype.getScrollableContainers_ = function()
{
    var containers = [];

    goog.dom.getAncestor(this.form.element, function(node){
        if (node == document.body) {
            return true;
        }

        if (goog.dom.isElement(node)) {
            var element = /** @type {Element} */ (node);
            var overflow = goog.style.getComputedStyle(element, 'overflow');

            if (overflow == 'auto' || overflow == 'scroll') {
                if (this.isScrollableContainer_(element)) {
                    containers.push(element);
                }
            }
        }
    }.bind(this));

    return containers;
};

/**
 * @private
 * @param {Element} element
 * @return {boolean}
 */
nextform.handlers.error.TooltipErrorHandler.prototype.isScrollableContainer_ = function(element)
{
    var scrollHeight = element.scrollHeight;
    var elementSize = goog.style.getSize(element);

    return scrollHeight > elementSize.height;
};
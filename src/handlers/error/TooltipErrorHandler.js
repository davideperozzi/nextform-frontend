goog.provide('nextform.handlers.error.TooltipErrorHandler');

// goog
goog.require('goog.events.EventHandler');

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
        'hideOnScroll': true,
        'hideOnResize': false,
        'autoHideMs': 5000,
        'hideOnClick': true,
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
    this.resizeProvider_.init();
    this.scrollProvider_.init();

    this.hideOnScroll_ = !!this.config.get('hideOnScroll');
    this.hideOnResize_ = !!this.config.get('hideOnResize');

    goog.events.listen(this.resizeProvider_, dj.ext.providers.ResizeProvider.EventType.RESIZE,
        this.handleResize_, false, this);

    goog.events.listen(this.scrollProvider_, dj.ext.providers.ScrollProvider.EventType.SCROLL,
        this.handleScroll_, false, this);
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

        this.tooltip_.show(
            nextField.errorTarget || nextField.elements[0],
            nextError[0].message
        );

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
nextform.handlers.error.TooltipErrorHandler.prototype.handleScroll_ = function()
{
    if (this.hideOnScroll_) {
        this.tooltip_.hide();
    }
    else {
        this.tooltip_.update();
    }
};
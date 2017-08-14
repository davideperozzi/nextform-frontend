goog.provide('nextform.handlers.error.TooltipErrorHandler');

// goog
goog.require('goog.events.EventHandler');

// dj
goog.require('dj.ext.providers.ResizeProvider');

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
     * @type {number}
     */
    this.hideTimeout_ = -1;
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

    goog.events.listen(this.resizeProvider_, dj.ext.providers.ResizeProvider.EventType.RESIZE,
        this.handleResize_, false, this);
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

    if (this.formular.fields.containsKey(nextName)) {
        var nextField = this.formular.fields.get(nextName);

        this.tooltip_.show(
            nextField.elements[0],
            nextError[0].message
        );

        if (this.config.get('hideOnClick')) {
            this.elementHandler_.listenOnce(this.tooltip_.getElement(),
                goog.events.EventType.CLICK, function(){
                    this.tooltip_.hide();
                });
        }

        if (this.config.get('hideOnInteraction')) {
            if (nextField instanceof nextform.models.fields.CollectionFieldModel) {
                for (var i = 0, len = nextField.fields.length; i < len; i++) {
                    for (var ii in nextField.fields[i].elements) {
                        this.elementHandler_.listenOnce(nextField.fields[i].elements[ii],
                            [
                                goog.events.EventType.CLICK,
                                goog.events.EventType.FOCUS
                            ],
                            function(){
                                this.tooltip_.hide();
                            }
                        );
                    }
                }
            }
            else {
                for (var i = 0, len = nextField.elements.length; i < len; i++) {
                    this.elementHandler_.listenOnce(nextField.elements[i],
                        [
                            goog.events.EventType.CLICK,
                            goog.events.EventType.FOCUS
                        ],
                        function(){
                            this.tooltip_.hide();
                        }
                    );
                }
            }
        }

        if (this.config.get('autoHide')) {
            this.hideTimeout_ = setTimeout(function(){
                this.tooltip_.hide();
            }.bind(this), this.config.get('autoHideMs') || 5000);
        }
    }
};

/**
 * @private
 */
nextform.handlers.error.TooltipErrorHandler.prototype.handleResize_ = function()
{
    this.tooltip_.update();
};
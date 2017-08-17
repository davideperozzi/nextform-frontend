goog.provide('nextform.handlers.RequestHandler');

// goog
goog.require('goog.Promise');
goog.require('goog.net.XhrIo');
goog.require('goog.net.EventType');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');

// nextform
goog.require('nextform.models.ResultModel');
goog.require('nextform.providers.FormProvider');
goog.require('nextform.providers.ResponseProvider');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
nextform.handlers.RequestHandler = function()
{
    nextform.handlers.RequestHandler.base(this, 'constructor');

    /**
     * @private
     * @type {goog.net.XhrIo}
     */
    this.xhrIo_ = new goog.net.XhrIo();

    /**
     * @private
     * @type {goog.events.EventHandler}
     */
    this.eventHandler_ = new goog.events.EventHandler(this);

    /**
     * @private
     * @type {nextform.models.ResultModel}
     */
    this.lastResult_ = null;

    /**
     * @private
     * @type {goog.promise.Resolver}
     */
    this.eventResolver_ = null;
};

goog.inherits(
    nextform.handlers.RequestHandler,
    goog.events.EventTarget
);

/**
 * @public
 * @param {nextform.providers.FormProvider} provider
 * @return {goog.Promise}
 */
nextform.handlers.RequestHandler.prototype.send = function(provider)
{
    if (this.xhrIo_.isActive()) {
        if (this.eventResolver_) {
            this.eventResolver_.reject();
            this.eventResolver_ = null;
        }

        this.xhrIo_.abort();
    }

    this.eventResolver_ = goog.Promise.withResolver();

    this.eventHandler_.unlisten(
        this.xhrIo_,
        goog.net.EventType.COMPLETE,
        this.handleComplete_
    );

    this.eventHandler_.listen(
        this.xhrIo_,
        goog.net.EventType.COMPLETE,
        this.handleComplete_
    );

    this.xhrIo_.send(
        provider.getConfig('action'),
        provider.getConfig('method'),
        provider.getData()
    );

    return this.eventResolver_.promise;
};

/**
 * @private
 * @param {goog.events.Event} event
 */
nextform.handlers.RequestHandler.prototype.handleComplete_ = function(event)
{
    if (this.eventResolver_) {
        var provider = new nextform.providers.ResponseProvider();

        if (event.target.getStatus() == goog.net.HttpStatus.OK &&
            event.target.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE &&
            event.target.getLastErrorCode() == goog.net.ErrorCode.NO_ERROR) {
            var response = event.target.getResponse();

            if (goog.json.isValid(response)) {
                provider.parse(goog.json.parse(response));
            }
            else {
                provider.setError(nextform.models.ResultModel.ErrorMessage.INVALID_RESPONSE);
            }
        }
        else {
            provider.setError(nextform.models.ResultModel.ErrorMessage.UNKNOWN);
        }

        this.lastResult_ = provider.getResult();
        this.eventResolver_.resolve(provider);
        this.eventResolver_ = null;
    }
};

/**
 * @public
 * @return {nextform.models.ResultModel}
 */
nextform.handlers.RequestHandler.prototype.getLastResult = function()
{
    return this.lastResult_;
};
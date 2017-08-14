goog.provide('nextform.handlers.RequestHandler');

// goog
goog.require('goog.Promise');
goog.require('goog.net.XhrIo');
goog.require('goog.net.EventType');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');

// nextform
goog.require('nextform.models.ResultModel');
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
 * @param {nextform.providers.FormularProvider} provider
 * @return {goog.Promise}
 */
nextform.handlers.RequestHandler.prototype.send = function(provider)
{
    if (this.xhrIo_.isActive()) {
        this.xhrIo_.abort();
    }

    this.eventResolver_ = goog.Promise.withResolver();

    this.eventHandler_.unlisten(this.xhrIo_, goog.net.EventType.SUCCESS, this.handleSuccess_);
    this.eventHandler_.listen(this.xhrIo_, goog.net.EventType.SUCCESS, this.handleSuccess_);

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
nextform.handlers.RequestHandler.prototype.handleSuccess_ = function(event)
{
    if (this.eventResolver_) {
        var response = new nextform.providers.ResponseProvider();

        response.parse(event.target.getResponseJson());

        this.eventResolver_.resolve(response);
        this.eventResolver_ = null;
    }
};
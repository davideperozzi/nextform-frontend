goog.provide('nextform.handlers.UploadHandler');

// goog
goog.require('goog.Uri');
goog.require('goog.net.XhrIo');
goog.require('goog.events.EventHandler');
goog.require('nextform.events.UploadEvent');

// nextform
goog.require('nextform.providers.FormProvider');
goog.require('nextform.providers.ResponseProvider');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
nextform.handlers.UploadHandler = function()
{
    nextform.handlers.UploadHandler.base(this, 'constructor');

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
    this.uploadResolver_ = null;
};

goog.inherits(
    nextform.handlers.UploadHandler,
    goog.events.EventTarget
);

/**
 * @const
 * @type {string}
 */
nextform.handlers.UploadHandler.FILE_TRIGGER_NAME = '_d1b0162a7d9ae09d7898a36161227c9c';

/**
 * @private
 * @return {boolean}
 */
nextform.handlers.UploadHandler.prototype.isSupported_ = function()
{
    if (window.hasOwnProperty('FormData') &&
        typeof FormData.prototype.append == 'function') {
        return true;
    }

    return false;
};

/**
 * @public
 * @param {nextform.providers.FormProvider} provider
 * @return {goog.Promise}
 */
nextform.handlers.UploadHandler.prototype.upload = function(provider)
{
    if ( ! this.isSupported_()) {
        throw new Error('Your browser is too old to handle FormData objects');
    }

    if (this.xhrIo_.isActive()) {
        return goog.Promise.reject();
    }

    this.uploadResolver_ = goog.Promise.withResolver();

    // Reset previous
    this.eventHandler_.removeAll();

    // Set active
    this.xhrIo_.setProgressEventsEnabled(true);
    this.eventHandler_.listen(this.xhrIo_, goog.net.EventType.UPLOAD_PROGRESS,
        this.handleUploadProgress_.bind(this, provider));
    this.eventHandler_.listen(this.xhrIo_, goog.net.EventType.SUCCESS,
        this.handleUploadSuccess_.bind(this, provider));

    if (provider.hasFileField()) {
        var fileFields = provider.getFileFields();
        var formData = new FormData();

        fileFields.forEach(function(field, name){
            var files = provider.getFieldValue(field);

            for (var i = 0, len = files.length; i < len; i++) {
                formData.append(name, files[i]);
            }
        });

        formData.append(nextform.handlers.UploadHandler.FILE_TRIGGER_NAME, '');

        if (provider.hasSessionField()) {
            formData.append(
                provider.getSessionFieldName(),
                provider.getSessionFieldValue()
            );
        }
    }

    this.dispatchEvent(new nextform.events.UploadEvent(
        nextform.events.UploadEvent.EventType.START,
        provider.getModel()
    ));

    var actionUri = new goog.Uri(provider.getConfig('action'));

    this.xhrIo_.send(
        actionUri,
        provider.getConfig('method'),
        formData
    );

    return this.uploadResolver_.promise;
};

/**
 * @private
 * @param {nextform.providers.FormProvider} provider
 * @param {goog.events.Event} event
 */
nextform.handlers.UploadHandler.prototype.handleUploadProgress_ = function(provider, event)
{
    this.dispatchEvent(new nextform.events.UploadEvent(
        nextform.events.UploadEvent.EventType.PROGRESS,
        provider.getModel(),
        null,
        this.getEventProgress_(event)
    ));
};

/**
 * @private
 * @param {nextform.providers.FormProvider} provider
 * @param {goog.events.Event} event
 */
nextform.handlers.UploadHandler.prototype.handleUploadSuccess_ = function(provider, event)
{
    if (this.uploadResolver_) {
        var response = new nextform.providers.ResponseProvider();

        response.parse(event.target.getResponseJson());

        this.dispatchEvent(new nextform.events.UploadEvent(
            nextform.events.UploadEvent.EventType.COMPLETE,
            provider.getModel(),
            null,
            this.getEventProgress_(event)
        ));

        this.uploadResolver_.resolve(response);
        this.uploadResolver_ = null;
    }
};

/**
 * @private
 * @param {goog.events.Event} event
 * @return {number}
 */
nextform.handlers.UploadHandler.prototype.getEventProgress_ = function(event)
{
    if (event.hasOwnProperty('loaded') && event.hasOwnProperty('total')) {
        return event['loaded'] / event['total'];
    }

    return 0;
};
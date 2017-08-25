goog.provide('nextform.tasks.UploadTask');

// goog
goog.require('goog.json');
goog.require('goog.Promise');
goog.require('goog.net.XmlHttp');
goog.require('goog.net.HttpStatus');
goog.require('goog.net.XhrIoPool');
goog.require('goog.net.ErrorCode');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventHandler');

// nextform
goog.require('nextform.models.upload.DataModel');
goog.require('nextform.events.UploadEvent');

/**
 * @constructor
 * @param {goog.Uri} uri
 * @param {string=} optMethod
 * @extends {goog.events.EventTarget}
 */
nextform.tasks.UploadTask = function(uri, optMethod)
{
    nextform.tasks.UploadTask.base(this, 'constructor');

    /**
     * @private
     * @type {goog.Uri}
     */
    this.uri_ = uri;

    /**
     * @private
     * @type {string}
     */
    this.method_ = optMethod || 'GET';

    /**
     * @private
     * @type {goog.net.XhrIoPool}
     */
    this.xhrIoPool_ = new goog.net.XhrIoPool();

    /**
     * @private
     * @type {goog.events.EventHandler}
     */
    this.eventHandler_ = new goog.events.EventHandler(this);

    /**
     * @private
     * @type {Array<nextform.models.upload.DataModel>}
     */
    this.dataModels_ = [];

    /**
     * @private
     * @type {Array<nextform.models.upload.DataModel>}
     */
    this.completeModels_ = [];

    /**
     * @private
     * @type {number}
     */
    this.progress_ = 0;
};

goog.inherits(
    nextform.tasks.UploadTask,
    goog.events.EventTarget
);

/**
 * @public
 * @return {goog.Promise}
 */
nextform.tasks.UploadTask.prototype.run = function()
{
    this.resolver_ = goog.Promise.withResolver();

    for (var i = 0, len = this.dataModels_.length; i < len; i++) {
        var xhr = this.xhrIoPool_.createObject();

        xhr.setProgressEventsEnabled(true);

        this.eventHandler_.listen(xhr, goog.net.EventType.UPLOAD_PROGRESS,
            goog.partial(this.handleProgress_, this.dataModels_[i]));

        this.eventHandler_.listen(xhr, goog.net.EventType.COMPLETE,
            goog.partial(this.handleComplete_, this.dataModels_[i]));

        xhr.send(this.uri_, this.method_, this.dataModels_[i].data);
    }

    this.dispatchEvent(new nextform.events.UploadEvent(
        nextform.events.UploadEvent.EventType.START, this.dataModels_, this
    ));

    return this.resolver_.promise;
};

/**
 * @public
 * @param {nextform.models.upload.DataModel} model
 */
nextform.tasks.UploadTask.prototype.appendData = function(model)
{
    if (window.hasOwnProperty('FormData') &&
        window.hasOwnProperty('File') &&
        model.data instanceof FormData) {
        var entries = model.data['entries']();
        var next = {};

        while ((next = entries['next']()) && ! next.done) {
            if (next.value[1] instanceof File) {
                model.hasFiles = true;
                break;
            }
        }
    }

    this.dataModels_.push(model);
};

/**
 * @public
 * @return {number}
 */
nextform.tasks.UploadTask.prototype.getProgress = function()
{
    return this.progress_;
};

/**
 * @private
 * @param {goog.events.Event} event
 * @param {nextform.models.upload.DataModel} model
 */
nextform.tasks.UploadTask.prototype.handleProgress_ = function(model, event)
{
    if (event.hasOwnProperty('loaded') && event.hasOwnProperty('total')) {
        this.progress_ = event['loaded'] / event['total'];
    }

    var progressEvent = new nextform.events.UploadEvent(
        nextform.events.UploadEvent.EventType.PROGRESS, this.dataModels_, this
    );

    progressEvent.activeData = model;

    this.dispatchEvent(progressEvent);
};

/**
 * @private
 * @param {goog.events.Event} event
 * @param {nextform.models.upload.DataModel} model
 */
nextform.tasks.UploadTask.prototype.handleComplete_ = function(model, event)
{
    if (event.target.getStatus() == goog.net.HttpStatus.OK &&
        event.target.getReadyState() == goog.net.XmlHttp.ReadyState.COMPLETE &&
        event.target.getLastErrorCode() == goog.net.ErrorCode.NO_ERROR) {
        var response = event.target.getResponse();

        if (goog.json.isValid(response)) {
            model.response = goog.json.parse(response);

            var successEvent = new nextform.events.UploadEvent(
                nextform.events.UploadEvent.EventType.SUCCESS, this.dataModels_, this
            );

            successEvent.activeData = model;

            this.dispatchEvent(successEvent);
        }
        else {
            var errors = {};

            errors[model.field.name] = [{
                'error': nextform.models.ResultModel.ErrorMessage.INVALID_RESPONSE
            }];

            model.response = nextform.providers.ResponseProvider.createRaw(
                false, false, false, errors
            );
        }
    }
    else {
        var errors = {};

        errors[model.field.name] = [{
            'error': nextform.models.ResultModel.ErrorMessage.UNKNOWN
        }];

        model.response = nextform.providers.ResponseProvider.createRaw(
            false, false, false, errors
        );
    }

    this.completeModels_.push(model);
    this.checkComplete_();
};

/**
 * @private
 */
nextform.tasks.UploadTask.prototype.checkComplete_ = function()
{
    var complete = true;
    var responses = [];

    for (var i = 0, len = this.dataModels_.length; i < len; i++) {
        if ( ! goog.array.contains(this.completeModels_, this.dataModels_[i])) {
            complete = false;
        }
        else {
            responses.push(this.dataModels_[i].response);
        }
    }

    if (complete) {
        this.dispatchEvent(new nextform.events.UploadEvent(
            nextform.events.UploadEvent.EventType.COMPLETE, this.dataModels_, this
        ));

        this.resolver_.resolve(responses);
    }
};
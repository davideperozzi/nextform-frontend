goog.provide('nextform.handlers.UploadHandler');

// goog
goog.require('goog.Uri');
goog.require('goog.net.XhrIo');
goog.require('goog.async.nextTick');
goog.require('goog.events.EventHandler');

// nextform
goog.require('nextform.providers.FormProvider');
goog.require('nextform.providers.ResponseProvider');
goog.require('nextform.managers.UploadTaskManager');
goog.require('nextform.models.upload.DataModel');
goog.require('nextform.events.UploadEvent');
goog.require('nextform.tasks.UploadTask');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
nextform.handlers.UploadHandler = function()
{
    nextform.handlers.UploadHandler.base(this, 'constructor');

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

    var uploadUri = new goog.Uri(provider.getConfig('action'));
    var taskManager = new nextform.managers.UploadTaskManager();

    this.eventHandler_.listen(
        taskManager,
        [
            nextform.events.UploadEvent.EventType.START,
            nextform.events.UploadEvent.EventType.PROGRESS,
            nextform.events.UploadEvent.EventType.SUCCESS,
            nextform.events.UploadEvent.EventType.COMPLETE
        ],
        goog.partial(this.handleUploadEvent_, provider)
    );

    if (provider.hasFileField()) {
        var fileFields = provider.getFileFields();
        var preparedXhr = new goog.structs.Map();

        fileFields.forEach(function(field, name){
            var files = provider.getFieldValue(field);
            var data = new FormData();

            for (var i = 0, len = files.length; i < len; i++) {
                data.append(name, files[i]);
            }

            // Add flag fields and session field to get a relation to the form
            // in the backend application and recognizing uploads
            data.append(nextform.handlers.UploadHandler.FILE_TRIGGER_NAME, '');

            if (provider.hasSessionField()) {
                data.append(
                    provider.getSessionFieldName(),
                    provider.getSessionFieldValue()
                );
            }

            // Create task and append it to the task manager
            var dataModel = new nextform.models.upload.DataModel(field, data);
            var uploadTask = new nextform.tasks.UploadTask(
                uploadUri, provider.getConfig('method')
            );

            uploadTask.appendData(dataModel);
            taskManager.appendTask(uploadTask);
        });
    }

    var promise = taskManager.run();

    promise.then(function(response){
        this.lastResult_ = response.getResult();
    }, null, this);

    return promise;
};

/**
 * @private
 * @param {nextform.providers.FormProvider} provider
 * @param {nextform.events.UploadEvent} event
 */
nextform.handlers.UploadHandler.prototype.handleUploadEvent_ = function(provider, event)
{
    event.form = provider.getModel();

    this.dispatchEvent(event);
};

/**
 * @public
 * @return {nextform.models.ResultModel}
 */
nextform.handlers.UploadHandler.prototype.getLastResult = function()
{
    return this.lastResult_;
};
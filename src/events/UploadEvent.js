goog.provide('nextform.events.UploadEvent');

// goog
goog.require('goog.events.Event');

/**
 * @constructor
 * @param {string} type
 * @param {Array<nextform.models.upload.DataModel>} data
 * @param {nextform.tasks.UploadTask} task
 * @param {nextform.models.FormModel=} optForm
 * @param {number=} optProgress
 * @extends {goog.events.Event}
 */
nextform.events.UploadEvent = function(type, data, task, optForm)
{
    nextform.events.UploadEvent.base(this, 'constructor', type);

    /**
     * @public
     * @type {Array<nextform.models.upload.DataModel>}
     */
    this.data = data;

    /**
     * @public
     * @type {nextform.tasks.UploadTask}
     */
    this.task = task;

    /**
     * @public
     * @type {nextform.models.FormModel}
     */
    this.form = optForm || null;

    /**
     * @public
     * @type {nextform.models.upload.DataModel}
     */
    this.activeData = null;
};

goog.inherits(
    nextform.events.UploadEvent,
    goog.events.Event
);

/**
 * @enum {string}
 */
nextform.events.UploadEvent.EventType = {
    START: 'nextform.event.upload.start',
    SUCCESS: 'nextform.event.upload.success',
    COMPLETE: 'nextform.event.upload.complete',
    PROGRESS: 'nextform.event.upload.progress'
};
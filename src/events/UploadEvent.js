goog.provide('nextform.events.UploadEvent');

// goog
goog.require('goog.events.Event');

/**
 * @constructor
 * @param {string} type
 * @param {nextform.models.FormModel} form
 * @param {nextform.models.fields.AbstractFieldModel=} optField
 * @param {number=} optProgress
 * @extends {goog.events.Event}
 */
nextform.events.UploadEvent = function(type, form, optField, optProgress)
{
    nextform.events.UploadEvent.base(this, 'constructor', type);

    /**
     * @public
     * @type {nextform.models.FormModel}
     */
    this.form = form;

    /**
     * @public
     * @type {nextform.models.fields.AbstractFieldModel}
     */
    this.field = optField || null;

    /**
     * @public
     * @type {number}
     */
    this.progress = optProgress || 0;
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
    COMPLETE: 'nextform.event.upload.complete',
    PROGRESS: 'nextform.event.upload.progress'
};
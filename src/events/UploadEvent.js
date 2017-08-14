goog.provide('nextform.events.UploadEvent');

// goog
goog.require('goog.events.Event');

/**
 * @constructor
 * @param {string} type
 * @param {nextform.models.FormularModel} formular
 * @param {nextform.models.fields.AbstractFieldModel=} optField
 * @extends {goog.events.Event}
 */
nextform.events.UploadEvent = function(type, formular, optField)
{
    nextform.events.UploadEvent.base(this, 'constructor', type);

    /**
     * @public
     * @type {nextform.models.FormularModel}
     */
    this.formular = formular;

    /**
     * @public
     * @type {nextform.models.fields.AbstractFieldModel}
     */
    this.field = optField || null;
};

goog.inherits(
    nextform.events.UploadEvent,
    goog.events.Event
);

/**
 * @enum {string}
 */
nextform.events.UploadEvent.EventType = {
    STARTED: 'nextform.event.upload.started',
    COMPLETED: 'nextform.event.upload.completed',
    PROGRESS: 'nextform.event.upload.progress'
};
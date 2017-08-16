goog.provide('nextform.events.FormEvent');

// goog
goog.require('goog.events.Event');

/**
 * @constructor
 * @param {string} type
 * @param {nextform.models.ResultModel=} optResult
 * @extends {goog.events.Event}
 */
nextform.events.FormEvent = function(type, optResult)
{
    nextform.events.FormEvent.base(this, 'constructor', type);

    /**
     * @public
     * @type {nextform.models.ResultModel}
     */
    this.result = optResult || null;
};

goog.inherits(
    nextform.events.FormEvent,
    goog.events.Event
);

/**
 * @enum {string}
 */
nextform.events.FormEvent.EventType = {
    SEND: 'nextform.event.form.send',
    RESULT: 'nextform.event.form.result',
    SUBMIT: 'nextform.event.form.submit',
    REQUEST: 'nextform.event.form.request',
    VALIDATE: 'nextform.event.form.validate'
};
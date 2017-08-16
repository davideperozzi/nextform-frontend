goog.provide('nextform.events.SessionEvent');

// goog
goog.require('goog.events.Event');

/**
 * @constructor
 * @param {string} type
 * @param {nextform.controllers.FormController=} optForm
 * @param {nextform.models.ResultModel=} optResult
 * @extends {goog.events.Event}
 */
nextform.events.SessionEvent = function(type, optForm, optResult)
{
    nextform.events.SessionEvent.base(this, 'constructor', type);

    /**
     * @public
     * @type {nextform.controllers.FormController}
     */
    this.form = optForm || null;

    /**
     * @public
     * @type {nextform.models.ResultModel}
     */
    this.result = optResult || null;
};

goog.inherits(
    nextform.events.SessionEvent,
    goog.events.Event
);

/**
 * @enum {string}
 */
nextform.events.SessionEvent.EventType = {
    FORM_REQUEST: 'nextform.event.session.form_request',
    FORM_RESULT: 'nextform.event.session.form_result',
    COMPLETE: 'nextform.event.session.complete',
};
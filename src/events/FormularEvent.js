goog.provide('nextform.events.FormularEvent');

// goog
goog.require('goog.events.Event');

/**
 * @constructor
 * @param {string} type
 * @extends {goog.events.Event}
 */
nextform.events.FormularEvent = function(type)
{
    nextform.events.FormularEvent.base(this, 'constructor', type);
};

goog.inherits(
    nextform.events.FormularEvent,
    goog.events.Event
);

/**
 * @enum {string}
 */
nextform.events.FormularEvent.EventType = {
    SUBMIT: 'nextform.event.formular.submit',
    VALIDATE: 'nextform.event.formular.validate'
};
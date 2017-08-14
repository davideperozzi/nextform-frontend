goog.provide('nextform.events.SessionEvent');

// goog
goog.require('goog.events.Event');

/**
 * @constructor
 * @param {string} type
 * @extends {goog.events.Event}
 */
nextform.events.SessionEvent = function(type)
{
    nextform.events.SessionEvent.base(this, 'constructor', type);
};

goog.inherits(
    nextform.events.SessionEvent,
    goog.events.Event
);

/**
 * @enum {string}
 */
nextform.events.SessionEvent.EventType = {
    COMPLETED: 'nextform.event.session.completed',
};
goog.provide('nextform.controllers.SessionController');

// goog
goog.require('goog.string');
goog.require('goog.Promise');
goog.require('goog.structs.Map');
goog.require('goog.events.EventHandler');

// nextform
goog.require('nextform.events.SessionEvent');
goog.require('nextform.controllers.FormController');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
nextform.controllers.SessionController = function()
{
    nextform.controllers.SessionController.base(this, 'constructor');

    /**
     * @private
     * @type {goog.structs.Map<string, nextform.controllers.FormController>}
     */
    this.forms_ = new goog.structs.Map();

    /**
     * @private
     * @type {goog.events.EventHandler}
     */
    this.eventHandler_ = new goog.events.EventHandler(this);

    /**
     * @private
     * @type {Array<goog.promise.Resolver>}
     */
    this.completeResolvers_ = [];
};

goog.inherits(
    nextform.controllers.SessionController,
    goog.events.EventTarget
);

/**
 * @type {number}
 */
nextform.controllers.SessionController.NAME_COUNTER = 0;

/**
 * @public
 * @param {HTMLFormElement|nextform.controllers.FormController} form
 * @return {nextform.controllers.FormController}
 */
nextform.controllers.SessionController.prototype.addForm = function(form)
{
    var controller;

    if (form instanceof nextform.controllers.FormController) {
        controller = form;
    }
    else if (goog.dom.isElement(form)) {
        controller = new nextform.controllers.FormController();
        controller.init(form);
    }

    if ( ! controller) {
        throw new Error('Invalid form given. Can\'t be added to session.');
    }

    var name = controller.getName();

    if (goog.string.isEmptyOrWhitespace(name)) {
        name = this.getNextName_();
    }

    if (this.forms_.containsKey(name)) {
        throw new Error('A Form with name "' +  name + '" already exists');
    }

    this.eventHandler_.listen(controller, nextform.events.FormEvent.EventType.REQUEST,
        this.handleFormRequest_);

    this.eventHandler_.listen(controller, nextform.events.FormEvent.EventType.RESULT,
        this.handleFormResult_);

    this.forms_.set(name, controller);

    return controller;
};

/**
 * @private
 * @return {string}
 */
nextform.controllers.SessionController.prototype.getNextName_ = function()
{
    return 'form-' + (++nextform.controllers.SessionController.NAME_COUNTER);
};

/**
 * @private
 * @param {nextform.events.FormEvent} event
 */
nextform.controllers.SessionController.prototype.handleFormRequest_ = function(event)
{
    var formController = /** @type {nextform.controllers.FormController} */ (event.target);

    this.dispatchEvent(new nextform.events.SessionEvent(
        nextform.events.SessionEvent.EventType.FORM_REQUEST,
        formController
    ));
};

/**
 * @private
 * @param {nextform.events.FormEvent} event
 */
nextform.controllers.SessionController.prototype.handleFormResult_ = function(event)
{
    var formController = /** @type {nextform.controllers.FormController} */ (event.target);

    this.dispatchEvent(new nextform.events.SessionEvent(
        nextform.events.SessionEvent.EventType.FORM_RESULT,
        formController,
        event.result
    ));

    if (event.result && event.result.session && event.result.valid && event.result.complete) {
        this.dispatchEvent(new nextform.events.SessionEvent(
            nextform.events.SessionEvent.EventType.COMPLETE,
            formController,
            event.result
        ));
    }
};
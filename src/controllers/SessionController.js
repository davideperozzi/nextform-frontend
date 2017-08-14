goog.provide('nextform.controllers.SessionController');

// goog
goog.require('goog.string');
goog.require('goog.Promise');
goog.require('goog.structs.Map');
goog.require('goog.events.EventHandler');

// nextform
goog.require('nextform.events.SessionEvent');
goog.require('nextform.controllers.FormularController');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
nextform.controllers.SessionController = function()
{
    nextform.controllers.SessionController.base(this, 'constructor');

    /**
     * @private
     * @type {goog.structs.Map<string, nextform.controllers.FormularController>}
     */
    this.formulars_ = new goog.structs.Map();

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
 * @param {Element|nextform.controllers.FormularController}
 * @return {nextform.controllers.FormularController}
 */
nextform.controllers.SessionController.prototype.addFormular = function(form)
{
    var controller;

    if (form instanceof nextform.controllers.FormularController) {
        controller = form;
    }
    else if (goog.dom.isElement(form)) {
        controller = new nextform.controllers.FormularController();
        controller.init(form);
    }

    if ( ! controller) {
        throw new Error('Invalid form given. Can\'t be added to session.');
    }

    var name = controller.getName();

    if (goog.string.isEmpty(name)) {
        name = this.getNextName_();
    }

    if (this.formulars_.containsKey(name)) {
        throw new Error('A Formular with name "' +  name + '" already exists');
    }

    this.eventHandler_.listen(controller, nextform.events.FormularEvent.EventType.SUBMIT,
        this.handleFormSubmit_);

    this.formulars_.set(name, controller);

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
 * @param {nextform.events.FormularEvent} event
 */
nextform.controllers.SessionController.prototype.handleFormSubmit_ = function(event)
{
    var controller = /** @type {nextform.controllers.FormularController} */ (event.target);

    controller.send().then(function(result){
        if (result.session && result.valid) {
            this.dispatchEvent(new nextform.events.SessionEvent(
                nextform.events.SessionEvent.EventType.COMPLETED
            ));
        }
    }, null, this);
};
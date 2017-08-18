goog.provide('nextform.components.FileInputComponent');

// dj
goog.require('nextform.components.AbastractFieldComponent');

// nextform
goog.require('nextform.helpers.files');

/**
 * @constructor
 * @extends {nextform.components.AbastractFieldComponent}
 */
nextform.components.FileInputComponent = function()
{
    nextform.components.FileInputComponent.base(this, 'constructor');

    /**
     * @private
     * @type {goog.structs.Map<string, File>}
     */
    this.files_ = new goog.structs.Map();

    /**
     * @private
     * @type {boolean}
     */
    this.multiple_ = false;
};

goog.inherits(
    nextform.components.FileInputComponent,
    nextform.components.AbastractFieldComponent
);

/**
 * @enum {string}
 */
nextform.components.FileInputComponent.EventType = {
    UPDATE: 'nextform.components.file_input.update'
};

/** @export @inheritDoc */
nextform.components.FileInputComponent.prototype.ready = function()
{
    return this.baseReady(nextform.components.FileInputComponent, function(resolve, reject){
        this.inputElement_ = /** @type {HTMLInputElement} */ (this.getElement());

        if (this.inputElement_.tagName.toLowerCase() != 'input' ||
            this.inputElement_.getAttribute('type') != 'file') {
            throw new Error('Invalid element given for file input component');
        }

        this.multiple_ = this.inputElement_.hasAttribute('multiple');

        resolve();
    });
};

/** @export @inheritDoc */
nextform.components.FileInputComponent.prototype.init = function()
{
    return this.baseInit(nextform.components.FileInputComponent, function(resolve, reject){
        this.handler.listen(this.inputElement_, goog.events.EventType.CHANGE,
            this.handleInputChange_);
        resolve();
    });
};

/**
 * @inheritDoc
 * @return {Array<File>}
 */
nextform.components.FileInputComponent.prototype.getValue = function()
{
    return this.files_.getValues();
};

/** @inheritDoc */
nextform.components.FileInputComponent.prototype.clearValue = function()
{
    var files = goog.array.slice(/** @type {IArrayLike} */ (this.inputElement_.files), 0);

    for (var i = 0, len = files.length; i < len; i++) {
        var signature = nextform.helpers.files.signature(files[i]);

        if (this.files_.containsKey(signature)) {
            this.files_.remove(signature);
        }
    }

    this.dispatchEvent(nextform.components.FileInputComponent.EventType.UPDATE);

    this.inputElement_.value = null;
};

/**
 * @public
 * @return {goog.structs.Map<string, File>}
 */
nextform.components.FileInputComponent.prototype.getFiles = function()
{
    return this.files_;
};

/**
 * @public
 * @param {string|File} sigOrFile
 * @param {number=} optWaitBeforeDispatch
 * @return {boolean}
 */
nextform.components.FileInputComponent.prototype.remove = function(sigOrFile, optWaitBeforeDispatch)
{
    var signature = sigOrFile;

    if (signature instanceof File) {
        signature = nextform.helpers.files.signature(signature);
    }

    if (this.files_.remove(signature)) {
        setTimeout(function(){
            this.dispatchEvent(nextform.components.FileInputComponent.EventType.UPDATE);
        }.bind(this), parseInt(optWaitBeforeDispatch, 10) || 0);

        return true;
    }

    return false;
};

/**
 * @private
 * @param {goog.events.BrowserEvent} event
 */
nextform.components.FileInputComponent.prototype.handleInputChange_ = function(event)
{
    var files = goog.array.slice(/** @type {IArrayLike} */ (this.inputElement_.files), 0);

    if ( ! this.multiple_ && files.length > 0) {
        this.files_.clear();
    }

    goog.array.forEach(files, function(file){
        var signature = nextform.helpers.files.signature(file);

        if ( ! this.files_.containsKey(signature)) {
            this.files_.set(signature, file);
        }
    }, this);

    this.dispatchEvent(nextform.components.FileInputComponent.EventType.UPDATE);
};
goog.provide('nextform.components.FilePreviewComponent');

// goog
goog.require('goog.style');
goog.require('goog.string');
goog.require('goog.structs.Map');
goog.require('goog.dom.classlist');

// nextform
goog.require('dj.sys.components.AbstractComponent');
goog.require('nextform.helpers.files');

/**
 * @constructor
 * @extends {dj.sys.components.AbstractComponent}
 */
nextform.components.FilePreviewComponent = function()
{
    nextform.components.FilePreviewComponent.base(this, 'constructor');

    /**
     * @private
     * @type {nextform.components.FileInputComponent}
     */
    this.inputComponent_ = null;

    /**
     * @private
     * @type {Element}
     */
    this.previewContainer_ = null;

    /**
     * @private
     * @type {goog.structs.Map<string, Element>}
     */
    this.previewElements_ = new goog.structs.Map();

    /**
     * @private
     * @type {goog.dom.DomHelper}
     */
    this.domHelper_ = goog.dom.getDomHelper();
};

goog.inherits(
    nextform.components.FilePreviewComponent,
    dj.sys.components.AbstractComponent
);

/** @export @inheritDoc */
nextform.components.FilePreviewComponent.prototype.ready = function()
{
    return this.baseReady(nextform.components.FilePreviewComponent, function(resolve, reject){
        var containerClass = this.getConfig('container');

        this.previewContainer_ = this.queryElement(containerClass);
        this.inputComponent_ = /** @type {nextform.components.FileInputComponent} */ (
            this.queryComponent(nextform.components.FileInputComponent)
        );

        if ( ! (this.inputComponent_ instanceof nextform.components.FileInputComponent)) {
            throw new Error('No file input component found to preview files from');
        }

        if ( ! this.previewContainer_) {
            if (containerClass) {
                throw new Error('Container with class ' + containerClass + ' not found');
            }
            else {
                throw new Error('Please define a container to render the preview elements in');
            }
        }

        return this.initComponent(this.inputComponent_);
    });
};

/** @export @inheritDoc */
nextform.components.FilePreviewComponent.prototype.init = function()
{
    return this.baseInit(nextform.components.FilePreviewComponent, function(resolve, reject){
        this.handler.listen(this.inputComponent_, nextform.components.FileInputComponent.EventType.UPDATE,
            this.handleInputUpdate_);

        resolve();
    });
};

/**
 * @private
 */
nextform.components.FilePreviewComponent.prototype.handleInputUpdate_ = function()
{
    this.updatePreviewElements_();
};

/**
 * @private
 */
nextform.components.FilePreviewComponent.prototype.updatePreviewElements_ = function()
{
    var files = this.inputComponent_.getFiles();

    // Remove unused preview elements
    this.previewElements_.forEach(function(element, signature){
        if ( ! files.containsKey(signature)) {
            this.removePreviewElement_(signature);
        }
    }, this);

    // Add new preview elemenets
    files.forEach(function(file, signature){
        if ( ! this.previewElements_.containsKey(signature)) {
            this.addPreviewElement_(signature, this.createPreviewElement_(file));
        }
    }, this);

    goog.dom.classlist.enable(this.getElement(), 'has-file',
        this.previewElements_.getCount() > 0);
};

/**
 * @private
 * @param {File} file
 * @return {Element}
 */
nextform.components.FilePreviewComponent.prototype.createPreviewElement_ = function(file)
{
    var baseClass = 'nextform-file-preview';
    var classPrefix = baseClass + '--';
    var nameElement = this.domHelper_.createDom('span', classPrefix + 'file-name');
    var sizeElement = this.domHelper_.createDom('span', classPrefix + 'file-size');
    var extensionElement = this.domHelper_.createDom('span', classPrefix + 'file-extension');
    var removeButton = this.domHelper_.createDom('div', classPrefix + 'file-remove', [
        this.domHelper_.createDom('div', classPrefix + 'file-remove-icon')
    ]);

    var element = this.domHelper_.createDom('div', baseClass, [
        removeButton,
        this.domHelper_.createDom('div', classPrefix + 'file-loader'),
        this.domHelper_.createDom('div', classPrefix + 'container', [
            nameElement, sizeElement, extensionElement
        ])
    ]);

    goog.dom.setTextContent(nameElement, file.name);
    goog.dom.setTextContent(sizeElement, (file.size / 1000000).toFixed(2) + ' mb');
    goog.dom.setTextContent(extensionElement, nextform.helpers.files.extension(file));

    if (goog.string.startsWith(file.type, 'image')) {
        goog.dom.classlist.enable(element, 'loading', true);

        setTimeout(function(){
            nextform.helpers.files.read(file).then(function(result){
                goog.style.setStyle(element, 'background-image', 'url(' + result + ')');
                goog.dom.classlist.enable(element, 'loading', false);
            }, null, this);
        }.bind(this), parseInt(this.getConfig('image-load-delay'), 10) || 0);
    }

    this.handler.listen(removeButton, goog.events.EventType.CLICK,
        goog.partial(this.handleRemoveButtonClick_, file));

    return element;
};

/**
 * @private
 * @param {Element} element
 * @param {string} signature
 */
nextform.components.FilePreviewComponent.prototype.addPreviewElement_ = function(signature, element)
{
    goog.dom.appendChild(this.previewContainer_, element);
    this.previewElements_.set(signature, element);
};

/**
 * @private
 * @param {string} signature
 * @return boolean
 */
nextform.components.FilePreviewComponent.prototype.removePreviewElement_ = function(signature)
{
    if (this.previewElements_.containsKey(signature)) {
        var element = this.previewElements_.get(signature);

        if (goog.dom.removeNode(element)) {
            this.previewElements_.remove(signature);
        }

        return true;
    }

    return false;
};

/**
 * @private
 * @param {File} file
 * @param {goog.events.BrowserEvent} event
 */
nextform.components.FilePreviewComponent.prototype.handleRemoveButtonClick_ = function(file, event)
{
    var signature = nextform.helpers.files.signature(file);

    if (this.previewElements_.containsKey(signature)) {
        var element = this.previewElements_.get(signature);
        var removeDelay = /** @type {number} */ (this.getConfig('remove-delay'));

        goog.dom.classlist.enable(element, 'removing', true);
        this.inputComponent_.remove(signature, removeDelay || 0);
    }
};
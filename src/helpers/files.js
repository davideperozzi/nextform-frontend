goog.provide('nextform.helpers.files');

// goog
goog.require('goog.events');
goog.require('goog.crypt.Md5');
goog.require('goog.Promise');

/**
 * @public
 * @param {File} file
 * @return {string}
 */
nextform.helpers.files.signature = function(file)
{
    var md5 = new goog.crypt.Md5();

    md5.update(file.name + file.size + file.type + file.lastModified);

    return goog.crypt.byteArrayToHex(md5.digest());
};

/**
 * @public
 * @param {File} file
 * @return {string}
 */
nextform.helpers.files.extension = function(file)
{
    var extParts = file.name.split('.');

    return extParts[extParts.length-1];
};

/**
 * @public
 * @param {File} file
 * @return {goog.Promise}
 */
nextform.helpers.files.read = function(file)
{
    return new goog.Promise(function(resolve, reject){
        if (nextform.helpers.files.fileReaderSupported()) {
            var reader = new FileReader();

            goog.events.listenOnce(reader, goog.events.EventType.LOAD, function(){
                resolve(reader.result);
            });

            goog.events.listenOnce(reader, goog.events.EventType.ERROR, function(){
                resolve(reader.error);
            });

            reader.readAsDataURL(/** @type {!Blob} */ (file));
        }
        else {
            reject('File reader not supported');
        }
    });
};

/**
 * @public
 * @return {boolean}
 */
nextform.helpers.files.fileReaderSupported = function()
{
    return window.hasOwnProperty('FileReader') && goog.isDefAndNotNull(FileReader);
};
goog.provide('nextform.managers.UploadTaskManager');

// goog
goog.require('goog.Promise');
goog.require('goog.events.EventHandler');

// nextform
goog.require('nextform.tasks.UploadTask');

/**
 * @constructor
 * @extends {goog.events.EventTarget}
 */
nextform.managers.UploadTaskManager = function()
{
    nextform.managers.UploadTaskManager.base(this, 'constructor');

    /**
     * @private
     * @type {Array<nextform.tasks.UploadTask>}
     */
    this.tasks_ = [];

    /**
     * @private
     * @type {goog.events.EventHandler}
     */
    this.eventHandler_ = new goog.events.EventHandler(this);
};

goog.inherits(
    nextform.managers.UploadTaskManager,
    goog.events.EventTarget
);

/**
 * @public
 * @param {nextform.tasks.UploadTask} task
 */
nextform.managers.UploadTaskManager.prototype.appendTask = function(task)
{
    this.eventHandler_.listen(
        task,
        [
            nextform.events.UploadEvent.EventType.START,
            nextform.events.UploadEvent.EventType.PROGRESS,
            nextform.events.UploadEvent.EventType.SUCCESS,
            nextform.events.UploadEvent.EventType.COMPLETE
        ],
        goog.partial(this.handleTaskEvent_, task)
    );

    this.tasks_.push(task);
};

/**
 * @public
 * @return {goog.Promise}
 */
nextform.managers.UploadTaskManager.prototype.run = function()
{
    var promises = [];
    var responseData = [];

    for (var i = 0, len = this.tasks_.length; i < len; i++) {
        var promise = this.tasks_[i].run();

        promise.then(function(responses){
            goog.array.forEach(responses, function(data){
                responseData.push(data);
            });
        });

        promises.push(promise);
    }

    return new goog.Promise(function(resolve, reject){
        goog.Promise.all(promises).then(function(){
            var response = new nextform.providers.ResponseProvider();

            for (var i = 0, len = responseData.length; i < len; i++) {
                response.parse(responseData[i]);
            }

            resolve(response);
        }, reject, this);
    }, this);
};

/**
 * @private
 * @param {nextform.tasks.UploadTask} task
 * @param {nextform.events.UploadEvent} event
 */
nextform.managers.UploadTaskManager.prototype.handleTaskEvent_ = function(task, event)
{
    this.dispatchEvent(event);
};
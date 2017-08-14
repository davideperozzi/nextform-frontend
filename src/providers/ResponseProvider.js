goog.provide('nextform.providers.ResponseProvider');

// nextform
goog.require('nextform.models.ResultModel');
goog.require('nextform.models.result.ErrorModel');

/**
 * @constructor
 */
nextform.providers.ResponseProvider = function()
{
    /**
     * @private
     * @type {nextform.models.ResultModel}
     */
    this.result_ = new nextform.models.ResultModel();
};

/**
 * @public
 * @param {Object} data
 */
nextform.providers.ResponseProvider.prototype.parse = function(data)
{
    if ( ! data.hasOwnProperty('valid') || ! data.hasOwnProperty('errors')) {
        throw new Error('Response data to parse is invalid');
    }

    this.result_.session = !!data['session'];
    this.result_.valid = !!data['valid'];

    if (goog.isObject(data['errors'])) {
        for (var name in data['errors']) {
            var errors = [];

            if (this.result_.errors.containsKey(name)) {
                errors = this.result_.errors.get(name);
            }
            else {
                this.result_.errors.set(name, errors);
            }

            for (var i in data['errors'][name]) {
                var errorObj = data['errors'][name][i];

                errors.push(new nextform.models.result.ErrorModel(
                    errorObj['error']
                ));
            }
        }
    }
};

/**
 * @public
 * @return {nextform.models.ResultModel}
 */
nextform.providers.ResponseProvider.prototype.getResult = function()
{
    return this.result_;
};
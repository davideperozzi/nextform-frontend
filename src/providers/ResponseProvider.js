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

    this.result_.session = this.result_.session && !!data['session'];
    this.result_.valid = this.result_.valid && !!data['valid'];

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

/**
 * @public
 * @param {string} message
 * @param {number=} optCode
 */
nextform.providers.ResponseProvider.prototype.setError = function(message, optCode)
{
    var code = optCode || nextform.models.ResultModel.ErrorCode.CUSTOM_ERROR;

    if ( ! optCode) {
        switch (message) {
            case nextform.models.ResultModel.ErrorMessage.INVALID_RESPONSE:
                code = nextform.models.ResultModel.ErrorCode.INVALID_RESPONSE;
                break;
        }
    }

    this.result_.valid = false;
    this.result_.session = false;
    this.result_.errorCode = code;
    this.result_.errorMessage = message;
};

/**
 * @public
 * @param {boolean} valid
 * @param {boolean} session
 * @param {Object=} optErrors
 * @return {Object}
 */
nextform.providers.ResponseProvider.createRaw = function(valid, session, optErrors)
{
    return {
        'valid': valid,
        'session': session,
        'errors': optErrors || {}
    };
};
(function () {
    'use strict';

    var _ = require('lodash');
    var Promise = require('bluebird');
    var request = Promise.promisify(require('request'));
    var errors = require('./errors.js');
    var InvalidEventError = errors.InvalidEventError;
    var InvalidMessageError = errors.InvalidMessageError;

    function line() {
        return {
            getMessage: function (event) {
                return Promise.try(function () {
                    if (event.type !== 'message') {
                        throw new InvalidEventError();
                    }

                    var message = event.message;

                    if (message.type !== 'text') {
                        throw new InvalidMessageError();
                    }

                    return message.text;
                });
            },
            reply: function (replyToken, message) {
                return request({
                    method: 'POST',
                    uri: 'https://api.line.me/v2/bot/message/reply',
                    headers: {
                        Authorization: 'Bearer ' + process.env.LINE_CHANNEL_ACCESS_TOKEN
                    },
                    json: {
                        replyToken: replyToken,
                        messages: [{
                            type: 'text',
                            text: message
                        }]
                    }
                });
            }
        };
    }

    module.exports = line();
})();
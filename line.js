(function () {
    'use strict';

    var Promise = require('bluebird');
    var request = Promise.promisify(require('request'));
    var CryptoJS = require('crypto-js');
    var errors = require('./errors.js');
    var InvalidEventError = errors.InvalidEventError;
    var InvalidMessageError = errors.InvalidMessageError;

    function line() {
        return {
            checkSignature: function (signature, body) {
                var hash = CryptoJS.HmacSHA256(JSON.stringify(body), process.env.LINE_CHANNEL_SECRET);
                var hashBase64 = CryptoJS.enc.Base64.stringify(hash);

                console.log('Received X-Line-Signature: ' + signature);
                console.log('Computed signature: ' + hashBase64);

                return signature === hashBase64;
            },
            getMessage: function (event) {
                return Promise.try(function () {
                    if (event.type !== 'message') {
                        console.log('Event type must be "message", not "' + event.type + '"');
                        throw new InvalidEventError();
                    }

                    var message = event.message;

                    if (message.type !== 'text') {
                        console.log('Message type must be "text", not "' + message.type + '"');
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
(function () {
    'use strict';

    var express = require('express');
    var bodyParser = require('body-parser');
    var _ = require('lodash');
    var request = require('request-promise');

    var app = express();
    var PORT = process.env.PORT || 9001;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.listen(PORT, function () {
        console.log('Server started on port ' + PORT);
    });

    app.get('/', function (req, res) {
        res.send('Hello World!');
    });

    app.post('/', function (req, res) {
        console.log(req.get('X-Line-Signature'));
        console.log(JSON.stringify(req.body));

        _.forEach(req.body.events, function (event) {
            if (event.type !== 'message') {
                return;
            }

            var message = event.message;

            if (message.type !== 'text') {
                return;
            }

            request({
                method: 'POST',
                uri: 'https://api.line.me/v2/bot/message/reply',
                headers: {
                    Authorization: 'Bearer ' + process.env.LINE_CHANNEL_ACCESS_TOKEN,
                },
                body: {
                    replyToken: event.replyToken,
                    messages: [{
                        type: 'text',
                        text: message.text
                    }]
                },
                json: true
            });
        });

        res.json(req.body);
    });
})();

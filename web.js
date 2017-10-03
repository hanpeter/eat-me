(function () {
    'use strict';

    var express = require('express');
    var bodyParser = require('body-parser');
    var _ = require('lodash');
    var Promise = require('bluebird');
    var request = Promise.promisify(require('request'));
    var yelp = require('./yelp.js');
    var line = require('./line.js');
    var db = require('./db.js');
    var errors = require('./errors.js');
    var strings = require('./strings.js');

    var app = express();
    var PORT = process.env.PORT || 9001;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.listen(PORT, function () {
        console.log('Server started on port ' + PORT);
    });

    app.post('/', function (req, res) {
        console.log('Received request: ' + JSON.stringify(req.body));

        if (!line.checkSignature(req.get('X-Line-Signature'), req.body)) {
            res.sendStatus(403);
        }

        var replies = [];

        _.forEach(req.body.events, function (event) {
            replies.push(
                line.getMessage(event)
                    .then(function (message) {
                        var split_message = message.text.split(' ');
                        var action_str = split_message[0];
                        var link = split_message[1];
                        var action = null;
                        var biz_id = null;
                        var user_id = message.user_id;

                        switch (action_str.toLowerCase()) {
                            case 'add':
                                action = db.addShop;
                                break;
                            case 'delete':
                                break;
                            case 'list':
                                break;
                            default:
                                console.log('Invalid action value: ' + action);
                                throw new errors.InvalidMessageError();
                        }

                        if (link.indexOf('yelp.com/biz/') < 0) {
                            console.log('Unable to find yelp link');
                            throw new errors.InvalidMessageError();
                        }
                        biz_id = link.split('yelp.com/biz/')[1];

                        return db.getUser(user_id)
                            .then(function (rows) {
                                if (rows.length) {
                                    return Promise.try(function () {
                                        return rows;
                                    });
                                }
                                else {
                                    return db.addUser(user_id, user_id);
                                }
                            })
                            .then(function (rows) {
                                return action(biz_id, user_id);
                            });
                    })
                    .catch(errors.InvalidEventError, function (error) {
                        return;
                    })
                    .catch(errors.InvalidMessageError, function (error) {
                        return line.reply(event.replyToken, strings.GenericUsageMessage);
                    })
            )
        });

        Promise.all(replies).then(function () {
            res.sendStatus(200);
        });
    });
})();

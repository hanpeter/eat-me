(function () {
    'use strict';

    var express = require('express');
    var bodyParser = require('body-parser');
    var _ = require('lodash');
    var Promise = require('bluebird');
    var request = Promise.promisify(require('request'));
    var yelp = require('./yelp.js');
    var line = require('./line.js');
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
        console.log(req.body);
        console.log(req.get('X-Line-Signature'));
        console.log(JSON.stringify(req.body));

        var replies = [];

        _.forEach(req.body.events, function (event) {
            replies.push(
                line.getMessage(event)
                    .then(function (message) {
                        return Promise.try(function () {
                            return message.split('yelp.com/biz/')[1];
                        });
                    })
                    .then(function (businessId) {
                        return yelp.getBusiness(businessId);
                    })
                    .then(function (business) {
                        var msgText = [
                            business.name,
                            'has rating of',
                            business.rating,
                            'and is currently',
                            (business.hours[0].is_open_now ? '' : 'not'),
                            'open'
                        ].join(' ');

                        return line.reply(event.replyToken, msgText);
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
            res.json(req.body);
        });
    });
})();

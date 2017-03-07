(function () {
    'use strict';

    var express = require('express');
    var bodyParser = require('body-parser');
    var _ = require('lodash');

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
        res.json(req.body);
    });
})();

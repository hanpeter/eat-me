(function () {
    'use strict';

    var Promise = require('bluebird');
    var pg = require('pg');

    var pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        //ssl: true,
    });

    function db() {
        return {
            getUser: function (user_id) {
                var client = null;
                return pool.connect()
                    .then(function (c) {
                        client = c;
                        return client.query({
                            name: 'getUser',
                            text: 'SELECT * FROM users WHERE user_id = $1::text;',
                            values: [user_id],
                        });
                    })
                    .then(function (response) {
                        client.release();
                        return Promise.try(function () {
                            return response.rows;
                        });
                    });
            },
            addUser: function (user_id, username) {
                var client = null;
                return pool.connect()
                    .then(function (c) {
                        client = c;
                        return client.query({
                            name: 'addUser',
                            text: 'INSERT INTO users (user_id, name) VALUES ($1::text, $2::text);',
                            values: [user_id, username],
                        });
                    })
                    .then(function (response) {
                        client.release();
                        return Promise.try(function () {
                            console.log(response);
                            return response.rows;
                        });
                    });
            },
            addShop: function (biz_id, user_id) {
                var client = null;
                return pool.connect()
                    .then(function (c) {
                        client = c;
                        return client.query({
                            name: 'findOrder',
                            text: 'SELECT list_order FROM shops WHERE user_id = $1::text ORDER BY list_order DESC FETCH FIRST 1 ROWS ONLY;',
                            values: [user_id],
                        });
                    })
                    .then(function (response) {
                        var order = response.rows.length ? response.rows[0].list_order + 1 : 0;

                        return client.query({
                            name: 'addShop',
                            text: 'INSERT INTO shops (biz_id, user_id, list_order) VALUES ($1::text, $2::text, $3::integer);',
                            values: [biz_id, user_id, order],
                        });
                    })
                    .then(function (response) {
                        client.release();
                        return Promise.try(function () {
                            console.log(response);
                            return response.rows;
                        });
                    });
            }
        };
    }

    module.exports = db();
})();

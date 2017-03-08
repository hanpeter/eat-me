(function () {
    'use strict';

    var _ = require('lodash');
    var Promise = require('bluebird');
    var request = Promise.promisify(require('request'));

    function yelp() {
        var access_token = undefined;

        function authenticate() {
            if (access_token) {
                return Promise.try(function () {
                    return access_token;
                });
            }

            return request({
                method: 'POST',
                uri: 'https://api.yelp.com/oauth2/token',
                form: {
                    grant_type: 'client_credentials',
                    client_id: process.env.YELP_APP_ID,
                    client_secret: process.env.YELP_APP_SECRET
                }
            }).then(function (resp) {
                return JSON.parse(resp.body).access_token;
            });
        }

        return {
            getBusiness: function (businessId) {
                return authenticate()
                    .then(function (access_token) {
                        return request({
                            method: 'GET',
                            uri: 'https://api.yelp.com/v3/businesses/' + businessId,
                            headers: {
                                Authorization: 'Bearer ' + access_token
                            },
                            json: true
                        });
                    })
                    .then(function (response) {
                        return response.body;
                    })
            }
        };
    }

    module.exports = yelp();
})();
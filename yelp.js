(function () {
    'use strict';

    var _ = require('lodash');
    var moment = require('moment');
    var Promise = require('bluebird');
    var request = Promise.promisify(require('request'));

    function yelp() {
        var access_token = {
            token: null,
            // Use the yesterday as a starting value.
            expires: moment().subtract(1, 'days')
        };

        function authenticate() {
            if (moment().isBefore(access_token.expires)) {
                return Promise.try(function () {
                    return access_token.token;
                });
            }

            return request({
                method: 'POST',
                uri: 'https://api.yelp.com/oauth2/token',
                form: {
                    grant_type: 'client_credentials',
                    client_id: process.env.YELP_APP_ID,
                    client_secret: process.env.YELP_APP_SECRET
                },
                json: true
            }).then(function (resp) {
                access_token.token = resp.body.access_token;
                access_token.expires = moment().add(resp.body.expires_in, 'seconds');
                console.log('A new token has been received', access_token);

                return access_token.token;
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
                    .then(function (resp) {
                        console.log('Found business', resp.body);
                        return resp.body;
                    })
            }
        };
    }

    module.exports = yelp();
})();

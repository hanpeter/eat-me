(function () {
    'use strict';

    var _ = require('lodash');
    var Promise = require('bluebird');
    var request = Promise.promisify(require('request'));

    function yelp() {
        var apiKey = process.env.YELP_API_KEY;

        return {
            getBusiness: function (businessId) {
                return request({
                    method: 'GET',
                    uri: 'https://api.yelp.com/v3/businesses/' + businessId,
                    headers: {
                        Authorization: 'Bearer ' + apiKey,
                    },
                    json: true
                })
                .then(function (resp) {
                    console.log('Found business', resp.body);
                    return resp.body;
                });
            }
        };
    }

    module.exports = yelp();
})();

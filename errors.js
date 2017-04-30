(function () {
    'use strict';

    var makeError = require('make-error');

    module.exports = {
        InvalidEventError: makeError('InvalidEventError'),
        InvalidMessageError: makeError('InvalidMessageError')
    };
})();
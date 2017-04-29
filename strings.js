(function () {
    'use strict';

    var genericUsageMessage = [
        '"Eat me!" can only support text messages of following format:',
        '  * add https://www.yelp.com/biz/insert-business-name-here',
        '  * delete https://www.yelp.com/biz/insert-business-name-here',
        '  * list',
    ].join('\n')

    module.exports = {
        GenericUsageMessage: genericUsageMessage
    };
})();
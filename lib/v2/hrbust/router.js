module.exports = function (router) {
    router.get('/graduate/:type', require('./graduate'));
    router.get('/jwzx/:type?/:page?', require('./jwzx'));
};

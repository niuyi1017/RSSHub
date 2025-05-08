module.exports = function (router) {
    router.get('/cmuyjs/:type', require('./cmuyjs'));
};

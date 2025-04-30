module.exports = function (router) {
    router.get('/adjust', require('./adjust'));
    router.get('/sszs', require('./sszs'));
};

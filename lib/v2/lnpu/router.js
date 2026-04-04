module.exports = function (router) {
  router.get('/ges/:type', require('./ges'));
};

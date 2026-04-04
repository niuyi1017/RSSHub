module.exports = function (router) {
  router.get('/recruit/:type', require('./recruit'));
};


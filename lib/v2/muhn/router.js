module.exports = function (router) {
  router.get('/zsw/:type', require('./zsw'));
};

module.exports = function (router) {
    const graduateAdmissions = require('./yjs');
    router.get('/yjs/:type', graduateAdmissions);
    router.get('/yzb/734', (ctx) => {
        ctx.params = { ...ctx.params, type: '7525' };
        return graduateAdmissions(ctx);
    });
};

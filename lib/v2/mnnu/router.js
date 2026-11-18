module.exports = function (router) {
    const graduateAdmissions = require('./yjsy');
    router.get('/yjsy/:type', graduateAdmissions);
    router.get('/yjsc/zsgz-ssyjszs', (ctx) => {
        ctx.params = { ...ctx.params, type: 'zsgz-ssyjszs' };
        return graduateAdmissions(ctx);
    });
};

'use strict';

/**
 * article controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::article.article', ({ strapi }) => ({
    async find(ctx) {
        // Calling the default core action
        const { data, meta } = await super.find(ctx);

        // custom logic to store articles to history
        const userId = ctx.state.user.id;

        // fetch histories data
        const histories = await strapi.entityService.findMany('api::history.history', {
            fields: ['*'],
            populate: ['user', 'articles'],
        });

        const isHistoryExist = await strapi.service('api::article.article')
            .isHistoryExist(userId, histories);

        if (!isHistoryExist) {
            // create new history from data article fetched data
            await strapi.entityService.create('api::history.history', {
                data: {
                    user: ctx.state.user,
                    recommendations: data,
                    publishedAt: new Date().getTime(),
                },
            });
        }
        else {
            // update history if there is any new data fetched by user
            await strapi.service('api::article.article')
                .updateHistory(userId, data);
        }

        return { data, meta };
    }

}));

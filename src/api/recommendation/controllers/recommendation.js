'use strict';

/**
 * recommendation controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::recommendation.recommendation', ({ strapi }) => ({
    async find(ctx) {
        // Calling the default core action
        const { data, meta } = await super.find(ctx);

        // custom logic store recommendations to history
        const userId = ctx.state.user.id;

        // fetch histories data
        const histories = await strapi.entityService.findMany('api::history.history', {
            fields: ['*'],
            populate: ['user', 'recommendations'],
        });

        // check if authenticated user have any history or not
        const isHistoryExist = await strapi.service('api::recommendation.recommendation')
            .isHistoryExist(userId, histories);

        if (!isHistoryExist) {
            // create new history from data recommendation fetched data
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
            await strapi.service('api::recommendation.recommendation')
                .updateHistory(userId, data);
        }

        return { data, meta };
    },
}));

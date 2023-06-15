'use strict';

/**
 * history controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::history.history', ({ strapi }) => ({
    async create(ctx) {

        const userId = ctx.state.user.id;
        const { articles, videos } = ctx.request.body.data;

        const histories = await strapi.entityService.findMany('api::history.history', {
            fields: ['*'],
            populate: ['user', 'articles', 'videos'],
        });

        const isHistoryExist = await strapi.service('api::article.article')
            .isHistoryExist(userId, histories);

        if (!isHistoryExist) {
            // create new history from data article fetched data
            const data = {
                user: userId,
                articles: articles,
                videos: videos,
                publishedAt: new Date().getTime(),
            }
            await strapi.entityService.create('api::history.history', {
                data
            });

            return {
                message: "New history created!"
            }
        }
        else {
            // update history if there is any new data fetched by user
            const statusArticles = await strapi.service('api::history.history')
                .updateHistoryArticle(userId, articles);
            const statusVideos = await strapi.service('api::history.history')
                .updateHistoryVideos(userId, videos);

            const message = statusArticles || statusVideos ? "Item(s) updated" : "Nothing updated";

            return {
                message: message
            }
        }
    },
}));

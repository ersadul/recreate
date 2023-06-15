'use strict';

/**
 * history service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::history.history', ({ strpi }) => ({
    async isHistoryExist(...args) {
        for (let history of args[1]) {
            if (args[0] == history.user.id) {
                return true
            }
        }
        return false
    },
    async updateHistoryArticle(...args) {
        const userId = args[0]

        const userEntry = await strapi.query('plugin::users-permissions.user').findOne({
            select: ['id'],
            where: { id: userId },
            populate: { history: true },
        });

        const historyId = userEntry.history.id

        const oldHistoryEntry = await strapi.query('api::history.history').findOne({
            select: ['id'],
            where: { id: historyId },
            populate: { articles: true },
        });

        // old history
        const arr1 = oldHistoryEntry.articles;
        // new history coming form request
        const arr2 = args[1];

        const haveSameItems = arr1.length === arr2.length && arr2.every(element => arr1.map(obj => obj.id).includes(element));


        if (!haveSameItems) {
            if (arr2.every(element => arr1.map(obj => obj.id).includes(element))) {
                return false;
            }
            // merged old and new history
            const mergedHistory = arr1.concat(arr2);
            // extract id
            const idValues = mergedHistory.map(obj => (typeof obj === "object") ? obj.id : obj);
            // extract unique ids
            const uniqueIds = [...new Set(idValues)].map(id => ({ id }));
            await strapi.entityService.update('api::history.history', historyId, {
                data: {
                    articles: uniqueIds
                },
            });

            return true;
        }

        return false;
    },
    async updateHistoryVideos(...args) {
        const userId = args[0]

        const userEntry = await strapi.query('plugin::users-permissions.user').findOne({
            select: ['id'],
            where: { id: userId },
            populate: { history: true },
        });

        const historyId = userEntry.history.id

        const oldHistoryEntry = await strapi.query('api::history.history').findOne({
            select: ['id'],
            where: { id: historyId },
            populate: { videos: true },
        });

        // old history
        const arr1 = oldHistoryEntry.videos
        // new history coming form request
        const arr2 = args[1]

        const haveSameItems = arr1.length === arr2.length && arr2.every(element => arr1.map(obj => obj.id).includes(element));

        if (!haveSameItems) {
            if (arr2.every(element => arr1.map(obj => obj.id).includes(element))) {
                return false;
            }
            // merged old and new history
            const mergedHistory = arr1.concat(arr2);
            // extract id
            const idValues = mergedHistory.map(obj => (typeof obj === "object") ? obj.id : obj);
            // extract unique ids
            const uniqueIds = [...new Set(idValues)].map(id => ({ id }));
            await strapi.entityService.update('api::history.history', historyId, {
                data: {
                    videos: uniqueIds
                },
            });

            return true;
        }

        return false;
    },
}));

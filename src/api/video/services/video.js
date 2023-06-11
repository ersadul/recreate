'use strict';

/**
 * video service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::video.video', ({strapi}) => ({
    async isHistoryExist(...args) {
        for (let history of args[1]) {
            if (args[0] == history.user.id) {
                return true
            }
        }
        return false
    },
    async updateHistory(...args) {
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

        const arr1 = oldHistoryEntry.videos
        const arr2 = args[1]

        const haveSameHistory = arr1.length === arr2.length && arr1.every(element => arr2.includes(element));

        if (!haveSameHistory) {
            const mergedHistory = arr1.concat(arr2);
            const idValues = mergedHistory.map(obj => obj.id);
            const uniqueIds = [...new Set(idValues)].map(id => ({ id }));

            await strapi.entityService.update('api::history.history', historyId, {
                data: {
                    videos: uniqueIds
                },
            });
        }
    },

}));

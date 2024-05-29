"use strict";

/**
 * product controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
async function createNotification({ ctx, productId }) {
  const sender = ctx.state.auth.credentials?.id;
  const followers = await getFollowersByUserId(sender);
  const followerIds = followers?.map((follower) => {
    return follower?.id;
  });
  const entry = await strapi.db.query("api::notification.notification").create({
    data: {
      receivers: followerIds,
      sender: sender,
      type: strapi.constants.NOTIFICATION_NEW_PRODUCT_TYPE,
      product: productId,
      readUsers: [],
      publishedAt: Date.now(),
    },
    populate: { sender: true, product: true },
  });
  for (let index = 0; index < followerIds?.length; index++) {
    const followerId = followerIds[index];
    sendNotificationToSocket({ userId: followerId, data: entry });
  }
}
async function getFollowersByUserId(userId) {
  const user = await strapi.db.query("plugin::users-permissions.user").findOne({
    where: {
      id: userId,
    },
    populate: { followers: true },
  });
  return user?.followers || [];
}

function sendNotificationToSocket({ userId, data }) {
  strapi.webSocket.to(`${userId}`).emit("notification", data);
}
const customizeControllers = ({ strapi }) => {
  return {
    async create(ctx) {
      const entry = await strapi.db.query("api::product.product").create({
        data: {
          ...ctx.request?.body?.data,
          publishedAt: Date.now(),
        },
      });
      await createNotification({ ctx, productId: entry?.id });
      return entry;
    },
  };
};
module.exports = createCoreController(
  "api::product.product",
  customizeControllers
);

"use strict";

/**
 * comment controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
async function createNotification({ ctx, product }) {
  const sender = ctx.state.auth.credentials?.id;
  const productOwner = product?.userId?.id;
  const entry = await strapi.db.query("api::notification.notification").create({
    data: {
      receivers: [productOwner],
      sender: sender,
      type: strapi.constants.NOTIFICATION_NEW_COMMENT_TYPE,
      product: product?.id,
      readUsers: [],
      publishedAt: Date.now(),
    },
    populate: {
      sender: {
        populate: ["avatar"],
      },
      product: true,
    },
  });
  strapi.commonFunctions.sendNotificationToSocket({
    userId: productOwner,
    data: entry,
  });
}

const customizeControllers = ({ strapi }) => {
  return {
    async create(ctx) {
      const entry = await strapi.db.query("api::comment.comment").create({
        data: {
          ...ctx.request?.body?.data,
          publishedAt: Date.now(),
        },
        populate: {
          product: {
            populate: {
              userId: true,
            },
          },
        },
      });
      await createNotification({ ctx, product: entry?.product });
      return entry;
    },
  };
};
module.exports = createCoreController(
  "api::comment.comment",
  customizeControllers
);

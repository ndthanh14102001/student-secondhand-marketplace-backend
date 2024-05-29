"use strict";

/**
 * notification controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const getUnReadNotificationsByUserId = async (ctx) => {
  const userId = ctx.state.auth.credentials?.id;
  return await strapi
    .service("api::notification.notification")
    .getUnReadNotificationsByUserId({ userId });
};
const customizeControllers = ({
  getUnReadNotificationsByUserId
});
module.exports = createCoreController(
  "api::notification.notification",
  customizeControllers
);

"use strict";

/**
 * notification controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const getReadNotificationsByUserId = async (ctx) => {
  const userId = ctx.state.auth.credentials?.id;
  return await strapi
    .service("api::notification.notification")
    .getReadNotificationsByUserId({ userId });
};
const customizeControllers = ({
  getReadNotificationsByUserId
});
module.exports = createCoreController(
  "api::notification.notification",
  customizeControllers
);

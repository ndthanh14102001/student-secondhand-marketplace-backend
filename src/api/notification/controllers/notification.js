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
const readNotification = async (ctx) => {
  const userId = ctx.state.auth.credentials?.id;
  const { notificationId } = ctx.params;
  await strapi
    .service("api::notification.notification")
    .readNotification({ userId, notificationId });
  return {
    message: "Read notification sucessfully",
  };
};
const readAllNotifications = async (ctx) => {
  const userId = ctx.state.auth.credentials?.id;
  await strapi
    .service("api::notification.notification")
    .readAllNotifications({ userId });
  return {
    message: "Read notifications sucessfully",
  };
};
const customizeControllers = {
  getUnReadNotificationsByUserId,
  readNotification,
  readAllNotifications,
};
module.exports = createCoreController(
  "api::notification.notification",
  customizeControllers
);

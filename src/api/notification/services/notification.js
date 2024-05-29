"use strict";

/**
 * notification service
 */

const { createCoreService } = require("@strapi/strapi").factories;
const getReadNotificationsByUserId = async ({ userId }) => {
  const entry = await strapi.db
    .query("api::notification.notification")
    .findMany({
      where: {
        $and: [
          {
            receivers: {
              $in: [userId],
            },
          },
          {
            readUsers: {
              $in: [userId],
            },
          },
        ],
      },
      populate: ["sender","readUsers"],
    });
  return entry;
};
const customizeServices = () => ({
  getReadNotificationsByUserId,
});
module.exports = createCoreService(
  "api::notification.notification",
  customizeServices
);

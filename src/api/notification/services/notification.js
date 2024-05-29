"use strict";

/**
 * notification service
 */

const { createCoreService } = require("@strapi/strapi").factories;
const getUnReadNotificationsByUserId = async ({ userId }) => {
  console.log("userId",userId)
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
              $notIn: [userId],
            },
          },
        ],
      },
      populate: ["sender","readUsers"],
    });
  return entry;
};
const customizeServices = () => ({
  getUnReadNotificationsByUserId,
});
module.exports = createCoreService(
  "api::notification.notification",
  customizeServices
);

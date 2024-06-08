"use strict";

/**
 * notification service
 */

const { createCoreService } = require("@strapi/strapi").factories;
const getUnReadNotificationsByUserId = async ({ userId }) => {
  const { rows } = await strapi.db.connection.raw(`
    select * 
    from notifications_receivers_links
    where user_id = ${userId}
    and notification_id not in (
      select notification_id 
      from notifications_read_users_links
      where user_id = ${userId}
    )
    `);
  return rows;
};
async function readNotification({ userId, notificationId }) {
  const notification = await getNotificationById(notificationId);
  console.log("notification", notification);
  if (!isRead({ notification, userId })) {
    const readUserIds = notification?.readUsers?.map((user) => {
      return user?.id;
    });
    readUserIds?.push(userId);
    await strapi.db.query("api::notification.notification").update({
      where: {
        id: notificationId,
      },
      data: {
        readUsers: readUserIds,
      },
    });
  }
}
async function getNotificationById(notificationId) {
  return await strapi.db.query("api::notification.notification").findOne({
    where: {
      id: notificationId,
    },
    populate: ["readUsers"],
  });
}
function isRead({ notification, userId }) {
  const readUsers = notification?.readUsers || [];
  for (let index = 0; index < readUsers?.length; index++) {
    const user = readUsers[index];
    if (user?.id === userId) {
      return true;
    }
  }
  return false;
}
const customizeServices = () => ({
  getUnReadNotificationsByUserId,
  readNotification,
});
module.exports = createCoreService(
  "api::notification.notification",
  customizeServices
);

"use strict";

/**
 * chat service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::chat.chat", ({ strapi }) => ({
  async countUnreadChatByUserId(receiver) {
    const [entries, count] = await strapi.db
      .query("api::chat.chat")
      .findWithCount({
        select: ["message"],
        where: { hasBeenSeen: false, receiver },
      });
    return count;
  },
  async findChatsByUserId(userId, queryParams) {
    const entry = await strapi.db.query("api::chat.chat").findMany({
      where: {
        receiver: userId,
      },
      ...queryParams,
    });
    return entry;
  },
  async findUnreadChatsByUserId(userId) {
    const entry = await strapi.db.query("api::chat.chat").findMany({
      where: {
        receiver: userId,
        hasBeenSeen: false,
      },
    });
    return entry;
  },
  async markMessagesAsSeen(senderId, receiverId) {
    while (true) {
      const entry = await strapi.db.query("api::chat.chat").update({
        where: {
          $and: [
            {
              sender: senderId,
            },
            {
              receiver: receiverId,
            },
            {
              hasBeenSeen: false,
            },
          ],
        },
        data: {
          hasBeenSeen: true,
        },
      });
      console.log("entry", entry);
      if (!entry) {
        break;
      }
    }
  },
  async markUserMessagesAsSeen(userId) {
    const unreadChats = await this.findUnreadChatsByUserId(userId);
    const promises = [];
    for (let index = 0; index < unreadChats.length; index++) {
      const chat = unreadChats[index];
      promises.push(this.markMessageAsSeen(chat?.id));
    }
    await Promise.all(promises);
  },
  async getPartner(userId) {
    const chats = await this.findChatsByUserId(userId, {
      populate: ["sender"],
    });
    const userIds = new Set();
    for (let index = 0; index < chats.length; index++) {
      const sender = chats[index]?.sender;
      userIds.add(sender?.id);
    }
    const users = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: {
          id: {
            $in: Array.from(userIds),
          },
        },
        populate: {
          avatar: true,
          // get all unread chats
          chats: {
            where: {
              hasBeenSeen: {
                $eq: false,
              },
              receiver: userId,
            },
            select: ["id"],
          },
        },
        select: ["id", "username", "fullName"],
      });
    return users;
  },
}));

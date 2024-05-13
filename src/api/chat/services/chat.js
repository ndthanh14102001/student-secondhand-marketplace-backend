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
  async findUnreadChatsByUserId(userId) {
    const entry = await strapi.db.query("api::chat.chat").findMany({
      where: {
        receiver: userId,
        hasBeenSeen: false,
      },
    });
    return entry;
  },
  async markMessageAsSeen(chatId) {
    const entry = await strapi.db.query("api::chat.chat").update({
      where: {
        id: chatId,
      },
      data: {
        hasBeenSeen: true,
      },
    });
    return entry;
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
}));

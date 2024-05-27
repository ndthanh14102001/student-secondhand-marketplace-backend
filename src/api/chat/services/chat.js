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
    const { rows} = await strapi.db.connection.raw(`
    select chats_sender_links.user_id, 
      up_users.username, 
      up_users.full_name, 
      MAX(chats.created_at) as lastMessageTime,
      count(case when chats.has_been_seen = false THEN 1 END) AS seenCount
    from chats, 
      chats_receiver_links, 
      chats_sender_links, 
      up_users
    where chats.id = chats_receiver_links.chat_id
      and chats.id = chats_sender_links.chat_id
      and chats_receiver_links.user_id = ${userId}
      and up_users.id = chats_sender_links.user_id
    group by chats_sender_links.user_id, 
      up_users.username, 
      up_users.full_name
    order by lastMessageTime DESC;
    `);
    return rows;
  },
}));

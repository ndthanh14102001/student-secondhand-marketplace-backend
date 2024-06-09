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
    let { rows} = await strapi.db.connection.raw(`
    select chats_sender_links.user_id, 
      up_users.username, 
      up_users.full_name, 
	    files.formats as avatar,
      MAX(chats.created_at) as lastMessageTime,
      count(case when chats.has_been_seen = false THEN 1 END) AS seenCount
    from chats, 
      chats_receiver_links, 
      chats_sender_links, 
      up_users,
	    files_related_morphs,
	    files
    where chats.id = chats_receiver_links.chat_id
      and chats.id = chats_sender_links.chat_id
      and chats_receiver_links.user_id = ${userId}
      and up_users.id = chats_sender_links.user_id
	    and files_related_morphs.related_type = 'plugin::users-permissions.user'
	    and files_related_morphs.related_id = up_users.id
	    and files.id = files_related_morphs.file_id
    group by chats_sender_links.user_id, 
      up_users.username, 
      up_users.full_name,
	    files.formats
    order by lastMessageTime DESC
    `);
    rows = rows?.map((row) => {
      return {
        ...row,
        avatar: {
          formats : JSON.parse(row?.avatar)
        }
      }
    })
    return rows;
  },
}));

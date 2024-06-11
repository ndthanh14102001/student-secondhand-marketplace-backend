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
    WITH all_chats AS (
        SELECT 
            c.id, 
            cs.user_id AS sender_id, 
            cr.user_id AS receiver_id, 
            c.has_been_seen,
        c.created_at
        FROM 
            chats c
        JOIN 
            chats_sender_links cs ON c.id = cs.chat_id
        JOIN 
            chats_receiver_links cr ON c.id = cr.chat_id
    ),
    partners as (
    SELECT 
        sender_id AS user_id, 
        COUNT(CASE WHEN has_been_seen = false THEN 1 END) AS seenCount,
        MAX(all_chats.created_at) as lastMessageTime
    FROM 
        all_chats
    WHERE 
        receiver_id = ${userId}
    GROUP BY 
        sender_id
    UNION 
    SELECT 
        receiver_id AS user_id, 
        0 AS seenCount,
      MAX(all_chats.created_at) as lastMessageTime
    FROM 
        all_chats
    WHERE 
        sender_id = ${userId}
    GROUP BY 
        receiver_id
    ), avatars as (
    select *
    from files_related_morphs,
      files
    where files_related_morphs.related_type = 'plugin::users-permissions.user'
      and files.id = files_related_morphs.file_id
    )
    select pa.user_id,
      MAX(pa.seenCount) as seenCount,
      MAX(lastMessageTime) as lastMessageTime,
      us.username,
      us.full_name,
      av.formats as avatar
    from partners as pa
      left join avatars as av 
        on av.related_id = pa.user_id
      left join up_users as us 
        on pa.user_id = us.id
    GROUP BY 
      pa.user_id,
      us.username,
      us.full_name,
      av.formats
    ORDER BY lastMessageTime DESC
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

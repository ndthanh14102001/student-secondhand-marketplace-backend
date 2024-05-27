"use strict";

/**
 * chat controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::chat.chat", ({ strapi }) => ({
  async countUnreadChat(ctx) {
    const userId = ctx.state.auth.credentials?.id;
    const count = await strapi
      .service("api::chat.chat")
      .countUnreadChatByUserId(userId);
    return {
      data: {
        total: count,
      },
    };
  },
  async getPartner(ctx) {
    const userId = ctx.state.auth.credentials?.id;
    const partner = await strapi.service("api::chat.chat").getPartner(userId);
    return {
      data: partner,
    };
  },
  async markMessagesAsSeen(ctx) {
    const userId = ctx.state.auth.credentials?.id;
    const { senderId } = ctx.params;
    await strapi
      .service("api::chat.chat")
      .markMessagesAsSeen(senderId, userId);
    return {
      data: {
        message: "Update successfully !",
      },
    };
  },
}));

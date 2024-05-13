"use strict";

/**
 * chat controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::chat.chat", ({ strapi }) => ({
  async readChats(ctx) {
    const userId = strapi.config?.ctx?.getUserIdByCtx(ctx);
    await strapi.service("api::chat.chat").markUserMessagesAsSeen(userId);

    return {
      data: {
        message: "Update successfully",
      },
    };
  },
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
}));

"use strict";
function setUpConstants({ strapi }) {
  strapi.constants = {
    NOTIFICATION_NEW_PRODUCT_TYPE: 1,
    NOTIFICATION_NEW_COMMENT_TYPE: 2,
  };
}
function sendNotificationToSocket({ userId, data }) {
  strapi.webSocket.to(`${userId}`).emit("notification", data);
}
function setUpCommonFunctions({ strapi }) {
  strapi.commonFunctions = {
    sendNotificationToSocket,
  };
}
module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    setUpConstants({ strapi });
    setUpCommonFunctions({ strapi });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    const jwtDecode = require("jwt-decode");
    //strapi.server.httpServer is the new update for Strapi V4
    var io = require("socket.io")(strapi.server.httpServer, {
      cors: {
        // cors setup
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });
    strapi.webSocket = io;
    io.on("connection", function (socket) {
      const userId = jwtDecode.jwtDecode(socket?.handshake?.auth?.token)?.id;
      socket.join(`${userId}`);
      socket.on("private message", async (data) => {
        io.to(`${data.to}`).emit("private message", {
          from: {
            id: userId,
          },
          to: {
            id: data.to,
          },
          content: data.content,
        });
        let strapiData = {
          data: {
            sender: userId,
            receiver: data.to,
            message: data.content,
            hasBeenSeen: false,
            publishedAt: Date.now(),
          },
        };
        await strapi.db.query("api::chat.chat").create(strapiData);
      });
    });
  },
};

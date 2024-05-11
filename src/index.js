"use strict";

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi } */) {
    const jwtDecode = require("jwt-decode");
    //strapi.server.httpServer is the new update for Strapi V4
    var io = require("socket.io")(strapi.server.httpServer, {
      cors: {
        // cors setup
        origin: process.env.CLIENT_ENDPOINT,
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true,
      },
    });
    io.on("connection", function (socket) {
      const userId = jwtDecode.jwtDecode(socket?.handshake?.auth?.token)?.id;
      console.log("connect", userId);
      socket.join(`${userId}`);
      socket.on("private message", async (data) => {
        console.log("userId", userId);
        // console.log("socket", socket);
        // Listening for a sendMessage connection
        let strapiData = {
          // Generating the message data to be stored in Strapi
          data: {
            from: userId,
            to: data.to,
            content: data.content,
          },
        };
        var axios = require("axios");
        console.log("axios", axios);

        axios
          .post(`${process.env.API_ENDPOINT}/chats`, strapiData) //Storing the messages in Strapi
          .then((e) => {
            console.log("data.to", data.to);
            io.to(`${data.to}`).emit("private message", {
              //Sending the message to the to user
              from: {
                id: userId,
              },
              to: {
                id: data.to,
              },
              content: data.content,
            });
          })
          .catch((e) => console.log("error", e.message));
      });
    });
  },
};

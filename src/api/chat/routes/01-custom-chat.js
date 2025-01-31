
module.exports = {
  routes: [
    { 
      method: 'GET',
      path: '/chats/unread/count',
      handler: 'chat.countUnreadChat',
    },
    { 
      method: 'PATCH',
      path: '/chats/read/:senderId',
      handler: 'chat.markMessagesAsSeen',
    },
    { 
      method: 'GET',
      path: '/chats/partners',
      handler: 'chat.getPartner',
    },
  ]
}
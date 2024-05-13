
module.exports = {
  routes: [
    { 
      method: 'GET',
      path: '/chats/unread/count',
      handler: 'chat.countUnreadChat',
    },
    { 
      method: 'PATCH',
      path: '/chats/read',
      handler: 'chat.readChats',
    },
    { 
      method: 'GET',
      path: '/chats/partners',
      handler: 'chat.getPartner',
    },
  ]
}
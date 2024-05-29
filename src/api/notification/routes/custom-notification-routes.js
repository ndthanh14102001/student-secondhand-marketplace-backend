
module.exports = {
  routes: [
    { 
      method: 'GET',
      path: '/notifications/unread',
      handler: 'notification.getUnReadNotificationsByUserId',
    },
    
  ]
}
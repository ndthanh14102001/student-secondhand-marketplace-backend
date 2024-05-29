
module.exports = {
  routes: [
    { 
      method: 'GET',
      path: '/notifications/read',
      handler: 'notification.getReadNotificationsByUserId',
    },
    
  ]
}
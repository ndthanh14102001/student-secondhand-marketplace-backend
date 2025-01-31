
module.exports = {
  routes: [
    { 
      method: 'GET',
      path: '/notifications/unread',
      handler: 'notification.getUnReadNotificationsByUserId',
    },
    { 
      method: 'PATCH',
      path: '/read/notification/:notificationId',
      handler: 'notification.readNotification',
    },
    { 
      method: 'PATCH',
      path: '/read/notifications',
      handler: 'notification.readAllNotifications',
    },
  ]
}
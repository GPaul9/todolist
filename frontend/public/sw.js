self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'У вас новое уведомление!',
      icon: '/assets/logo.png',
      data: {
        url: data.url || '/',
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'TodoList', options),
    );
  } catch (error) {
    console.error('Ошибка Service Worker при обработке push:', error);
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      const targetUrl = event.notification.data.url;

      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});

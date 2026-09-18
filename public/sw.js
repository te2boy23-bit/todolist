self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/logo.jpg",
      badge: "/logo.jpg",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
        url: data.url || "/",
      },
    };
    
    // バッジ（赤い数字）を更新する (もし対応していれば)
    if (navigator.setAppBadge) {
      navigator.setAppBadge(1).catch((error) => console.error(error));
    }

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("message", (event) => {
  if (event.data === "clearBadge" && navigator.clearAppBadge) {
    navigator.clearAppBadge().catch((error) => console.error(error));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

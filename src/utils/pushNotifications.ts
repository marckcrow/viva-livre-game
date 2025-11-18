// Request permission for push notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Show a local push notification
export function showNotification(title: string, options?: NotificationOptions) {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    // Use service worker if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          icon: '/placeholder.svg',
          badge: '/placeholder.svg',
          tag: 'achievement',
          requireInteraction: false,
          ...options
        });
      });
    } else {
      // Fallback to regular notification
      new Notification(title, {
        icon: '/placeholder.svg',
        badge: '/placeholder.svg',
        ...options
      });
    }
  }
}

// Check if notifications are supported and enabled
export function areNotificationsEnabled(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

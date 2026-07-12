import { Platform, Vibration } from 'react-native';

// Disable native push notifications module loading by default in standalone builds
// to prevent startup crashes when Google Services / Firebase is not configured.
// The premium In-App Notification Banner handles notifications inside the app.

export function initNotifications() {
  // Native push registration skipped to prevent startup crash in standalone APK
}

export async function triggerLocalNotification(title: string, body: string) {
  try {
    // Vibrate device to alert the user
    Vibration.vibrate([0, 400, 200, 400]);
  } catch {
    // silently catch vibration errors on unsupported devices
  }
}

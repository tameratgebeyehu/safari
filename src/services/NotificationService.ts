import { Platform, Vibration } from 'react-native';
import Constants from 'expo-constants';

// expo-notifications push token auto-registration crashes in Expo Go (SDK 53+).
// We detect Expo Go via executionEnvironment and skip loading the library entirely.
function isExpoGo(): boolean {
  try {
    const env = (Constants as any).executionEnvironment;
    // 'storeClient' = Expo Go, 'standalone' or 'bareWorkflow' = real build
    return env === 'storeClient';
  } catch {
    return false;
  }
}

let _Notifications: typeof import('expo-notifications') | null = null;

function getNotifications(): typeof import('expo-notifications') | null {
  if (isExpoGo()) return null; // skip entirely in Expo Go
  if (!_Notifications) {
    try {
      _Notifications = require('expo-notifications');
    } catch {
      return null;
    }
  }
  return _Notifications;
}

export function initNotifications() {
  const N = getNotifications();
  if (!N) return;

  try {
    N.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      } as any),
    });
  } catch {
    // not supported in this environment
  }

  requestPermissions();

  if (Platform.OS === 'android') {
    try {
      N.setNotificationChannelAsync('default', {
        name: 'default',
        importance: N.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#10B981',
      });
    } catch {
      // not supported in this environment
    }
  }
}

async function requestPermissions() {
  const N = getNotifications();
  if (!N) return false;
  try {
    const existing: any = await N.getPermissionsAsync();
    if (!existing?.granted) {
      await N.requestPermissionsAsync();
    }
    return true;
  } catch {
    return false;
  }
}

export async function triggerLocalNotification(title: string, body: string) {
  const N = getNotifications();
  if (!N) return; // silently skip in Expo Go

  try {
    Vibration.vibrate([0, 400, 200, 400]);
    await N.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null,
    });
  } catch {
    // not supported in this environment
  }
}

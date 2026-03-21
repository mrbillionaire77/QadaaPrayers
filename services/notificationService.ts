import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NOTIFICATION_ID } from '@/constants/config';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleReminderNotification(): Promise<void> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    // Cancel existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('prayer-reminder', {
        name: 'تذكير الصلوات',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C5A028',
      });
    }

    await Notifications.scheduleNotificationAsync({
      identifier: `prayer-reminder-${NOTIFICATION_ID}`,
      content: {
        title: '🕌 تذكير قضاء الصلوات',
        body: 'هل قمت بتسجيل صلواتك الفائتة اليوم؟',
        sound: true,
        ...(Platform.OS === 'android' && { channelId: 'prayer-reminder' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 0,
      },
    });
  } catch {
    // silent fail – notifications not critical
  }
}

export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

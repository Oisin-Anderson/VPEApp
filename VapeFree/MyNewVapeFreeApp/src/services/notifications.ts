import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

// Cancel all scheduled notifications
export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Schedule reminders at specific times daily
export const scheduleReminders = async () => {
  await cancelAllReminders();

  // Schedule notifications at 12pm, 6pm, and 12am daily
  const notificationTimes = [
    { hour: 12, minute: 0 }, // 12:00 PM
    { hour: 18, minute: 0 }, // 6:00 PM
    { hour: 0, minute: 0 },  // 12:00 AM
  ];

  for (const time of notificationTimes) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Remember to track your vape usage',
        body: '',
      },
      trigger: {
        type: SchedulableTriggerInputTypes.CALENDAR,
        hour: time.hour,
        minute: time.minute,
        repeats: true, // Repeat daily
      },
    });
  }
};

// Schedule N notifications a few seconds apart for demo/testing
export const scheduleDemoNotifications = async (count: number) => {
  await cancelAllReminders();
  for (let i = 0; i < count; i++) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Remember to track your vape usage',
        body: '',
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5 + i * 5,
        repeats: false,
      },
    });
  }
};

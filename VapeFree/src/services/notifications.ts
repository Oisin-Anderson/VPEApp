import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

// Cancel all scheduled notifications
export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Schedule reminders at specific times daily
export const scheduleReminders = async () => {
  try {
    await cancelAllReminders();

    // Schedule notifications at 12pm, 6pm, and 12am daily
    const notificationTimes = [
      { hour: 12, minute: 0 }, // 12:00 PM
      { hour: 18, minute: 0 }, // 6:00 PM
      { hour: 0, minute: 0 },  // 12:00 AM
    ];

    for (const time of notificationTimes) {
      try {
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
      } catch (error) {
        console.log(`Failed to schedule notification for ${time.hour}:${time.minute}:`, error);
        // Continue with other notifications even if one fails
      }
    }
  } catch (error) {
    console.error('Error in scheduleReminders:', error);
    throw error;
  }
};



import * as Notifications from 'expo-notifications';

// Cancel all scheduled notifications
export const cancelAllReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

// Schedule reminders evenly throughout the day
export const scheduleReminders = async (remindersPerDay: number) => {
  await cancelAllReminders();

  const startHour = 8; // 8am
  const endHour = 22; // 10pm
  const interval = (remindersPerDay > 1)
    ? (endHour - startHour) / (remindersPerDay - 1)
    : 0;

  for (let i = 0; i < remindersPerDay; i++) {
    const triggerHour = Math.round(startHour + i * interval);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Don't forget to track your puffs!",
        body: "Open the app and log your progress.",
      },
      trigger: {
        hour: triggerHour,
        minute: 0,
        repeats: true,
      },
    });
  }
};

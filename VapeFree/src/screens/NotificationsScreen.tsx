import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Switch,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { scheduleDemoNotifications } from '../services/notifications';

const { width, height } = Dimensions.get('window');
const scale = width / 375;

const NOTIF_ENABLED_KEY = 'notificationsEnabled';
const NOTIF_COUNT_KEY = 'notificationsPerDay';

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [remindersPerDay, setRemindersPerDay] = useState(3);
  const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState<boolean | null>(null);
  const prevSystemEnabled = useRef<boolean | null>(null);
  const prevReminders = useRef<number>(3);

  useEffect(() => {
    const fetchSettings = async () => {
      const enabled = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
      const count = await AsyncStorage.getItem(NOTIF_COUNT_KEY);
      setNotificationsEnabled(enabled !== 'false');
      setRemindersPerDay(count ? parseInt(count, 10) : 3);
      // Check system notification permissions
      const { status } = await Notifications.getPermissionsAsync();
      setSystemNotificationsEnabled(status === 'granted');
    };
    fetchSettings();
  }, []);

  // Schedule notifications when systemNotificationsEnabled becomes true
  useEffect(() => {
    if (systemNotificationsEnabled && !prevSystemEnabled.current) {
      scheduleDemoNotifications(remindersPerDay);
    }
    prevSystemEnabled.current = systemNotificationsEnabled;
  }, [systemNotificationsEnabled, remindersPerDay]);

  // Schedule notifications when remindersPerDay changes and notifications are enabled
  useEffect(() => {
    if (systemNotificationsEnabled && prevReminders.current !== remindersPerDay) {
      scheduleDemoNotifications(remindersPerDay);
    }
    prevReminders.current = remindersPerDay;
  }, [remindersPerDay, systemNotificationsEnabled]);

  const changeReminders = async (delta: number) => {
    let newCount = remindersPerDay + delta;
    if (newCount < 1) newCount = 1;
    if (newCount > 12) newCount = 12;
    setRemindersPerDay(newCount);
    await AsyncStorage.setItem(NOTIF_COUNT_KEY, newCount.toString());
  };

  const openAppNotificationSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      // For Android, this opens the app's notification settings
      Linking.openSettings();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Notifications</Text>
        {/* 1. System notification status */}
        <View style={styles.option}>
          <Ionicons name="notifications" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.label}>
            App Notifications: {systemNotificationsEnabled === null ? '...' : systemNotificationsEnabled ? 'ON' : 'OFF'}
          </Text>
        </View>
        {/* 2. Reminders per Day */}
        <View style={styles.option}>
          <Ionicons name="repeat" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Reminders per Day</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => changeReminders(-1)}
              disabled={remindersPerDay <= 1}
            >
              <Ionicons name="remove" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.reminderCount}>{remindersPerDay}</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => changeReminders(1)}
              disabled={remindersPerDay >= 10}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {/* 3. Open Notification Settings */}
        <TouchableOpacity
          style={styles.option}
          onPress={openAppNotificationSettings}
        >
          <Ionicons name="settings" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Open Notification Settings</Text>
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.closeButtonText}>Back to Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: height * 0.06,
    paddingHorizontal: width * 0.06,
  },
  scrollContent: {
    paddingBottom: height * 0.05,
  },
  header: {
    fontSize: scale * 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: height * 0.035,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderRadius: 12,
    marginBottom: height * 0.015,
  },
  icon: {
    marginRight: width * 0.04,
  },
  label: {
    fontSize: scale * 16,
    color: '#fff',
    marginRight: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  stepperButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 4,
    marginHorizontal: 4,
  },
  reminderCount: {
    color: '#fff',
    fontSize: scale * 16,
    minWidth: 24,
    textAlign: 'center',
  },
  buttonWrapper: {
    paddingBottom: height * 0.04,
    paddingHorizontal: width * 0.06,
    alignItems: 'center',
    marginBottom: height * 0.05,
  },
  closeButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.2,
    width: '100%',
  },
  closeButtonText: {
    color: '#000',
    fontSize: scale * 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NotificationsScreen; 
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { scheduleReminders } from '../services/notifications';

const { width, height } = Dimensions.get('window');
const scale = width / 375;

const NOTIF_ENABLED_KEY = 'notificationsEnabled';
const NOTIF_COUNT_KEY = 'notificationsPerDay';
const MAX_REMINDERS = 15;

const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [systemNotificationsEnabled, setSystemNotificationsEnabled] = useState<boolean | null>(null);
  const prevSystemEnabled = useRef<boolean | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const enabled = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
      setNotificationsEnabled(enabled !== 'false');
      // Check system notification permissions
      const { status } = await Notifications.getPermissionsAsync();
      setSystemNotificationsEnabled(status === 'granted');
    };
    fetchSettings();
  }, []);

  // Schedule notifications when systemNotificationsEnabled becomes true
  useEffect(() => {
    if (systemNotificationsEnabled && !prevSystemEnabled.current) {
      scheduleReminders();
    }
    prevSystemEnabled.current = systemNotificationsEnabled;
  }, [systemNotificationsEnabled]);

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
          <Text style={styles.label}>Daily Reminders</Text>
          <Text style={styles.reminderInfo}>12pm, 6pm, 12am</Text>
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
  reminderInfo: {
    color: '#aaa',
    fontSize: scale * 14,
    marginLeft: 'auto',
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
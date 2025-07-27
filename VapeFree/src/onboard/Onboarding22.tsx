import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Responsive scaling functions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size; // iPhone X width
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size; // iPhone X height

const Onboarding22 = () => {
  const navigation = useNavigation<any>();

  const handleContinue = async () => {
    try {
      console.log('Starting handleContinue...');
      
      // Show onboarding message first, then request notification permissions
      await AsyncStorage.setItem('hasUsedApp', 'true');
      console.log('hasUsedApp set to true');
      
      try {
        const permissionResult = await Notifications.requestPermissionsAsync();
        console.log('Permission result:', permissionResult);
      } catch (permissionError) {
        console.log('Permission request failed, but continuing:', permissionError);
      }
      
      // Schedule the standard daily reminders (12pm, 6pm, 12am)
      try {
        const { scheduleReminders } = await import('../services/notifications');
        await scheduleReminders();
        console.log('Notifications scheduled successfully');
      } catch (notificationError) {
        console.log('Notification scheduling failed, but continuing:', notificationError);
        // Continue even if notification scheduling fails
      }
      
      console.log('Navigating to Onboarding23...');
      navigation.navigate('Onboarding23');
    } catch (error) {
      console.error('Error in handleContinue:', error);
      // Still navigate even if there's an error
      navigation.navigate('Onboarding23');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.message}>
          Get reminded with notifications!
        </Text>
        <Text style={styles.message}>
          We'll remind you to record your puffs a few times a day.
        </Text>
        <Text style={styles.message}>
          Tap below to allow notifications and begin tracking.
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Enable Notifications</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboarding22;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: scale(24),
    justifyContent: 'space-between',
    paddingTop: verticalScale(60),
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    color: '#ffffff',
    fontSize: scale(24),
    textAlign: 'center',
    lineHeight: verticalScale(36),
    paddingBottom: verticalScale(16),
    paddingTop: verticalScale(10),
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: verticalScale(16),
    borderRadius: scale(30),
    alignItems: 'center',
    width: SCREEN_WIDTH - scale(48),
    alignSelf: 'center',
    marginBottom: Platform.OS === 'android' ? 60 : 30,
  },
  buttonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: scale(16),
  },
  notSoGood: {
    color: '#EF4444',
    fontSize: 26,
  },
  great: {
    color: '#3B82F6',
    fontSize: 34,
  },

});
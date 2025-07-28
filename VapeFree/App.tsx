import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { PuffProvider } from './src/context/PuffContext'; // or ../context/PuffContext
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';


/*Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true, // ✅ required
    shouldShowList: true,   // ✅ required
  }),
});*/

SystemUI.setBackgroundColorAsync('#000');

// Set Android navigation bar to black
if (Platform.OS === 'android') {
  NavigationBar.setBackgroundColorAsync('#000');
  NavigationBar.setButtonStyleAsync('light');
}

const generateUserId = () => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getOrCreateUserId = async () => {
  try {
    let userId = await AsyncStorage.getItem('app_user_id');
    if (!userId) {
      userId = generateUserId();
      await AsyncStorage.setItem('app_user_id', userId);
    }
    return userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return generateUserId();
  }
};


export default function App() {

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    if (Platform.OS === 'android') {
       Purchases.configure({apiKey: 'goog_kQVOcjDakWJEEhcswnvEAErObHO'});
    }

    // Initialize RevenueCat
    const initializeRevenueCat = async () => {
      try {
        // Get or create user ID
        const userId = await getOrCreateUserId();
        
        await Purchases.configure({
          apiKey: 'goog_kQVOcjDakWJEEhcswnvEAErObHO',
          appUserID: userId,
        });
        console.log('RevenueCat initialized successfully.');
      } catch (error) {
        console.error('Error initializing RevenueCat:', error);
      }
    };

    initializeRevenueCat();
  }, []);

  return (
    <PuffProvider>
      <NavigationContainer>
        <View style={styles.container}>
          <StatusBar style="auto" />
          <AppNavigator />
        </View>
      </NavigationContainer>
    </PuffProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
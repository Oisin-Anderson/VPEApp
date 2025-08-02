import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { PuffProvider } from './src/context/PuffContext';
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
    // Set Android navigation bar to black
    if (Platform.OS === 'android') {
      const setNavigationBarStyle = async () => {
        try {
          // For edge-to-edge mode, use setStyle method (primary approach)
          NavigationBar.setStyle('dark');
          
          // Also try individual methods as fallback
          await NavigationBar.setBackgroundColorAsync('#000000');
          await NavigationBar.setButtonStyleAsync('light');
          await NavigationBar.setVisibilityAsync('visible');
        } catch (error) {
          console.log('Navigation bar styling error:', error);
        }
      };

      // Set immediately
      setNavigationBarStyle();
      
      // Set again after delays to ensure it takes effect
      setTimeout(setNavigationBarStyle, 500);
      setTimeout(setNavigationBarStyle, 1000);
      setTimeout(setNavigationBarStyle, 2000);
    }

    // Initialize RevenueCat
    const initializeRevenueCat = async () => {
      try {
        Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
        
        // Get or create user ID
        const userId = await getOrCreateUserId();
        
        await Purchases.configure({
          apiKey: 'goog_kQVOcjDakWJEEhcswnvEAErObHO',
          appUserID: userId,
        });
        console.log('RevenueCat initialized successfully.');
        
        // Force refresh entitlements after Android's automatic restore
        if (Platform.OS === 'android') {
          setTimeout(async () => {
            try {
              console.log('=== APP INIT: FORCING ENTITLEMENT REFRESH ===');
              
              // First try to restore purchases manually
              console.log('Attempting manual restore...');
              const restoredCustomerInfo = await Purchases.restorePurchases();
              console.log('Restore result:', restoredCustomerInfo);
              console.log('Restored entitlements:', restoredCustomerInfo.entitlements.active);
              
              // Then get fresh customer info
              const customerInfo = await Purchases.getCustomerInfo();
              console.log('Customer info after refresh:', customerInfo);
              console.log('All entitlements:', customerInfo.entitlements);
              console.log('Active entitlements:', customerInfo.entitlements.active);
              console.log('PuffDaddy Pro entitlement:', customerInfo.entitlements.active['PuffDaddy Pro']);
              console.log('Original app user ID:', customerInfo.originalAppUserId);
              console.log('Current app user ID:', customerInfo.originalAppUserId);
            } catch (error) {
              console.error('Error refreshing entitlements:', error);
            }
          }, 2000); // Wait 2 seconds for Android's automatic restore to complete
        }
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
          <StatusBar style="light" backgroundColor="#000000" />
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
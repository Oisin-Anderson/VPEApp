import { NavigationContainer } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Purchases from 'react-native-purchases';
import { PuffProvider } from './src/context/PuffContext'; // or ../context/PuffContext
import AppNavigator from './src/navigation/AppNavigator';


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


export default function App() {

  useEffect(() => {
    Purchases.configure({ apiKey: 'goog_kQVOcjDakWJEEhcswnvEAErObHO' }); // TODO: Replace with your actual RevenueCat public API key
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
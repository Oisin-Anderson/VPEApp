import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { PuffProvider } from './src/context/PuffContext'; // or ../context/PuffContext
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';


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
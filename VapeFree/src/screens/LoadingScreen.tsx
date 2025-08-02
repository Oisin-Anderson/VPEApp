// src/screens/LoadingScreen.tsx
import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LoadingScreen = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const initialize = async () => {
      // Simulate delay
      await new Promise((res) => setTimeout(res, 1000));

      const hasUsedApp = await AsyncStorage.getItem('hasUsedApp');

      if (hasUsedApp) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    };

    initialize();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')} // 👈 replace with your icon (from first image)
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // match your app theme
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
  },
});
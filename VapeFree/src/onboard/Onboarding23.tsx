import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProgressBar from '../components/ProgressBar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Responsive scaling functions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size; // iPhone X width
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size; // iPhone X height

const Onboarding18 = () => {
  const navigation = useNavigation<any>();

  const handleContinue = async () => {
    await AsyncStorage.setItem('hasUsedApp', 'true');
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.message}>
          Before you start, remember that quitting any bad habit takes time.
        </Text>
        <Text style={styles.message}>
          It may be 1, 3 or 6 months before you fully stop your need to vape.
        </Text>
        <Text style={styles.message}>
          Just know that PuffDaddy is looking out for you.
        </Text>
      </View>


      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Begin your journey</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboarding18;

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
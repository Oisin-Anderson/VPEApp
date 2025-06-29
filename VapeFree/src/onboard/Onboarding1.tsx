// src/screens/Onboarding1.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Add this line


const Onboarding1 = () => {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const setStartDate = async () => {
      const today = new Date().toISOString().split('T')[0]; // Store as YYYY-MM-DD
      await AsyncStorage.setItem('startDate', today);
    };

    setStartDate();
  }, []);

  const handleNext = () => {
    navigation.navigate('Onboarding2');
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Welcome to PuffDaddy</Text>
        <Text style={styles.subtitle}>
          Starting today, let’s quit vaping and take back control of your life again.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Take Back Control</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding1;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  videoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 1.1,
  },
  video: {
    width: width * 0.85,
    height: '100%',
    borderRadius: 20,
  },
  content: {
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginBottom: 20,
    width: '100%',
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  linkText: {
    color: '#ccc',
    fontSize: 15,
    textAlign: 'center',
  },
});
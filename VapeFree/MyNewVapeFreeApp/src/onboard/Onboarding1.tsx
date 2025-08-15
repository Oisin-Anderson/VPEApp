// src/screens/Onboarding1.tsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Add this line
import { imgStyle as styles } from '../styles/imgStyle';


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
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Take Back Control</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding1;
// src/screens/Onboarding1.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Add this line
import { imgStyle as styles } from '../styles/imgStyle';
import ProgressBar from '../components/ProgressBar';

const Onboarding21 = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    navigation.navigate('Onboarding22');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={3} totalSteps={3} />
      <View style={styles.videoContainer}>
        
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Track your Progress</Text>
        <Text style={styles.subtitle}>
          Look back at your journey and track your usage over time
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding21;
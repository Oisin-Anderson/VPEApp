// src/screens/Onboarding1.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Add this line
import { imgStyle as styles } from '../styles/imgStyle';
import ProgressBar from '../components/ProgressBar';

const Onboarding14 = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    navigation.navigate('Onboarding15');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={5} totalSteps={6} />
      <View style={styles.videoContainer}>
        
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>We'll Develop a quitting plan for you</Text>
        <Text style={styles.subtitle}>
          By weaning you down over time, until you don't feel the need to vape anymore
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding14;
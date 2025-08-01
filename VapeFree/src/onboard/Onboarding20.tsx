// src/screens/Onboarding1.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Add this line
import { imgStyle as styles } from '../styles/imgStyle';
import ProgressBar from '../components/ProgressBar';

const Onboarding20 = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    navigation.navigate('Onboarding21');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={2} totalSteps={3} />
      <View style={styles.videoContainer}>
        <Image 
          source={require('../../assets/goalsScreen.jpg')} 
          style={styles.video}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Create a quitting plan</Text>
        <Text style={styles.subtitle}>
          Set a starting limit and quit date and we'll help you wean off your vape over time until you don't want it anymore
        </Text>
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding20;
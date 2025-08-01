// src/screens/Onboarding1.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Add this line
import { imgStyle as styles } from '../styles/imgStyle';
import ProgressBar from '../components/ProgressBar';

const Onboarding19 = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    navigation.navigate('Onboarding20');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={3} />
      <View style={styles.videoContainer}>
        <Image 
          source={require('../../assets/homeScreen.jpg')} 
          style={styles.video}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Record your Puffs</Text>
        <Text style={styles.subtitle}>
          Manually enter your puffs each day so you become more mindful of your usage
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

export default Onboarding19;
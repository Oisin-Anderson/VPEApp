// src/screens/Onboarding1.tsx
import { useNavigation } from '@react-navigation/native'; // Add this line
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { imgStyle as styles } from '../styles/imgStyle';

const Onboarding14 = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    navigation.navigate('Onboarding15');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={5} totalSteps={6} />
      <View style={styles.videoContainer}>
        <Image 
          source={require('../../assets/goalIcon.png')} 
          style={[styles.video, { width: '95%' }]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>We'll Develop a quitting plan for you</Text>
        <Text style={styles.subtitle}>
          By weaning you down over time, until you don't feel the need to vape anymore
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

export default Onboarding14;
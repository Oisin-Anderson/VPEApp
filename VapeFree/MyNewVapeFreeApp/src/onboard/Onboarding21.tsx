// src/screens/Onboarding1.tsx
import { useNavigation } from '@react-navigation/native'; // Add this line
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { imgStyle as styles } from '../styles/imgStyle';

const Onboarding21 = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    navigation.navigate('Onboarding22');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={3} totalSteps={3} />
      <View style={styles.videoContainer}>
        <Image 
          source={require('../../assets/quitPlan.jpg')} 
          style={[styles.video, { width: '95%' }]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Track your Progress</Text>
        <Text style={styles.subtitle}>
          Look back at your journey and track your usage over time
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

export default Onboarding21;
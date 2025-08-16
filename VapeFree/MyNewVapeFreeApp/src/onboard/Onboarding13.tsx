// src/screens/Onboarding1.tsx
import { useNavigation } from '@react-navigation/native'; // Add this line
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { imgStyle as styles } from '../styles/imgStyle';

const Onboarding13 = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    navigation.navigate('Onboarding14');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={4} totalSteps={6} />
      <View style={styles.videoContainer}>
        <Image 
          source={require('../../assets/quitPlan.jpg')} 
          style={[styles.video, { width: '95%' }]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>We'll Force you to take accountability</Text>
        <Text style={styles.subtitle}>
          By manually entering each puff, you'll become more mindful of your bad habit
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

export default Onboarding13;
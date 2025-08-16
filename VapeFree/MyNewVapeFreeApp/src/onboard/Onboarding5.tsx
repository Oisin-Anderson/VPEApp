// src/screens/Onboarding1.tsx
import { useNavigation } from '@react-navigation/native'; // Add this line
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { imgStyle as styles } from '../styles/imgStyle';

const Onboarding5 = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    navigation.navigate('Onboarding6');
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Image 
          source={require('../../assets/quitPlan.jpg')} 
          style={[styles.video, { width: '95%' }]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Let’s Build Your Report</Text>
        <Text style={styles.subtitle}>
          Just 3 questions left — your personalized report is almost ready.
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

export default Onboarding5;
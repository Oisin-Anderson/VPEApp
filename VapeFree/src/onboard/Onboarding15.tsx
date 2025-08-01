// src/screens/Onboarding15.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Add this line
import { imgStyle as styles } from '../styles/imgStyle';
import ProgressBar from '../components/ProgressBar';

const Onboarding15 = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    navigation.navigate('Onboarding16');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={6} totalSteps={6} />
      <View style={styles.videoContainer}>
        <Image 
          source={require('../../assets/moneyIcon.png')} 
          style={[styles.video, { width: '95%' }]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>We'll Help you Keep your money</Text>
        <Text style={styles.subtitle}>
          By reducing your puff count, which will allow you to use your money for something better
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

export default Onboarding15;
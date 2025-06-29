// src/screens/Onboarding19.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProgressBar from '../components/ProgressBar';

const Onboarding19 = () => {
  const navigation = useNavigation<any>();

  const handleNext = () => {
    navigation.navigate('Onboarding20');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={3} />

      <View style={styles.imageContainer}>
        {/*<Image
          source={require('../assets/images/phone_mockup.png')} // Replace with actual image path
          style={styles.image}
          resizeMode="contain"
        />*/}
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitleHeader}>How does Opal work?</Text>
        <Text style={styles.subtitle}>
          <Text style={styles.boldText}>Take action with sessions{'\n'}</Text>
          Opal will shield apps on your phone while you're focusing, and you can always snooze to unblock them temporarily.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding19;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: width * 1.1,
  },
  image: {
    width: width * 0.85,
    height: '100%',
  },
  content: {
    paddingHorizontal: 30,
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  subtitleHeader: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 40,
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
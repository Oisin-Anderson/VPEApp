import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProgressBar from '../components/ProgressBar';

const Onboarding10 = () => {
  const navigation = useNavigation<any>();

  const handleContinue = () => {
    navigation.navigate('Onboarding11');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={3} />
      <View style={styles.messageContainer}>
        <Text style={styles.message}>
          Some not-so-good news,{'\n'}and some great news.
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboarding10;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 40,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    color: '#ffffff',
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: width - 48,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
});
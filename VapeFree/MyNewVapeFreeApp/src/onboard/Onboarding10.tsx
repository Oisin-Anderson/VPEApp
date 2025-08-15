import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProgressBar from '../components/ProgressBar';
import { sharedStyles as styles, scale, verticalScale } from '../styles/choiceStyle';

// Responsive scaling functions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Onboarding10 = () => {
  const navigation = useNavigation<any>();
  const [fadeAnim] = React.useState(new Animated.Value(1));

  const handleContinue = () => {
    navigation.navigate('Onboarding11');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={6} />
      <View style={styles.content}>
        <View style={{ flex: 1, justifyContent: 'center', width: '100%' }}>
          <Text style={{ color: '#ffffff', fontSize: scale(30), textAlign: 'center', lineHeight: verticalScale(36), paddingBottom: verticalScale(10), paddingTop: verticalScale(10) }}>
            Some{' '}
            <Text style={{ color: '#EF4444', fontSize: 26 }}>not-so-good</Text>
            {' '}news, and some{' '}
            <Text style={{ color: '#3B82F6', fontSize: 34 }}>great</Text>
            {' '}news.
          </Text>
        </View>
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding10;
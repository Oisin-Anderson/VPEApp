import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePuff } from '../context/PuffContext';
import MaskedView from '@react-native-masked-view/masked-view';
import ProgressBar from '../components/ProgressBar';

// Responsive scaling functions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;

const Onboarding11 = () => {
  const navigation = useNavigation<any>();
  const { puffCount } = usePuff();
  const yearlyCost = ((puffCount * 365) / 500) * 10;

  const handleContinue = () => {
    navigation.navigate('Onboarding12');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={2} totalSteps={6} />
      <View style={styles.textBlock}>
        <Text style={styles.topText}>
          If you keep up your current vape usage, you're on track to spend
        </Text>

        <MaskedView maskElement={<Text style={styles.gradientText}>€{yearlyCost.toFixed(2)}</Text>}>
          <LinearGradient
            colors={['#EF4444', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.gradientText, { opacity: 0 }]}>€{yearlyCost.toFixed(2)}</Text>
          </LinearGradient>
        </MaskedView>

        <Text style={styles.bottomText}>
          on vapes this year.
          {'\n'}Yep, you read this right.
        </Text>
      </View>

      <View style={styles.bottomBlock}>
        <Text style={styles.caption}>
          Based on your daily puff count. This is a rough estimate which depends on the vapes you use.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding11;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: scale(24),
    justifyContent: 'space-between',
    paddingTop: verticalScale(60),
    paddingBottom: Platform.OS === 'android' ? verticalScale(60) : verticalScale(30),
  },
  textBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: {
    color: '#fff',
    fontSize: scale(18),
    textAlign: 'center',
    marginBottom: verticalScale(16),
    lineHeight: verticalScale(26),
  },
  gradientText: {
    fontSize: scale(48),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomText: {
    color: '#fff',
    fontSize: scale(18),
    textAlign: 'center',
    marginTop: verticalScale(16),
    lineHeight: verticalScale(26),
  },
  caption: {
    color: '#aaa',
    fontSize: scale(13),
    textAlign: 'center',
    marginBottom: verticalScale(20),
    paddingHorizontal: scale(10),
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: verticalScale(16),
    borderRadius: scale(30),
    width: SCREEN_WIDTH - scale(48),
    alignSelf: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: scale(16),
    textAlign: 'center',
  },
  bottomBlock: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
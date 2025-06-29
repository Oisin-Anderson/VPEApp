import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePuff } from '../context/PuffContext';
import MaskedView from '@react-native-masked-view/masked-view';
import ProgressBar from '../components/ProgressBar';

const Onboarding11 = () => {
  const navigation = useNavigation<any>();
  const { puffCount } = usePuff();
  const yearlyCost = ((puffCount * 365) / 500) * 10;

  const handleContinue = () => {
    navigation.navigate('Onboarding12');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={2} totalSteps={3} />
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
          Based on your daily puff count. It could be much more, depending on the vapes you use.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding11;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingTop: 10,
  },
  textBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  gradientText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 26,
  },
  caption: {
    color: '#aaa',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 30,
    width: width - 48,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  bottomBlock: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});
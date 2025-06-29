import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { usePuff } from '../context/PuffContext';
import ProgressBar from '../components/ProgressBar';

const quitGoalDaysMap: Record<string, number> = {
  '1 week': 7,
  '2 weeks': 14,
  '1 month': 30,
  '3 months': 90,
  '6 months': 180,
  'Other': 60, // default/fallback
};

const Onboarding12 = () => {
  const navigation = useNavigation<any>();
  const { puffCount, quitGoal } = usePuff();

  let quitInDays: number;

  if (quitGoalDaysMap[quitGoal]) {
    quitInDays = quitGoalDaysMap[quitGoal];
  } else {
    const today = new Date();
    const target = new Date(quitGoal); // ISO string
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    quitInDays = Math.max(diff, 7); // enforce at least 7 days
  }

  const preQuitPuffs = (puffCount / 2) * quitInDays;
  const postQuitPuffs = 0;
  const adjustedTotalPuffs = preQuitPuffs + postQuitPuffs;
  const adjustedCost = ((adjustedTotalPuffs / 500) * 10);

  const originalCost = ((puffCount * 365) / 500) * 10;
  const moneySaved = originalCost - adjustedCost;

  const handleContinue = () => {
    navigation.navigate('Onboarding16');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={3} totalSteps={3} />
      <View style={styles.textBlock}>
        <Text style={styles.topText}>
          If you stick to your goal, you could save
        </Text>

        <MaskedView maskElement={<Text style={styles.gradientText}>€{moneySaved.toFixed(2)}</Text>}>
          <LinearGradient
            colors={['#EF4444', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.gradientText, { opacity: 0 }]}>€{moneySaved.toFixed(2)}</Text>
          </LinearGradient>
        </MaskedView>

        <Text style={styles.bottomText}>
          this year alone.
          {'\n'}Think of what you could do with that money...
        </Text>
      </View>

      <View style={styles.bottomBlock}>
        <Text style={styles.caption}>
          Based on your daily puff count and quit goal.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding12;

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
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { usePuff } from '../context/PuffContext';
import ProgressBar from '../components/ProgressBar';
import { sharedStyles as styles, scale, verticalScale } from '../styles/choiceStyle';

// Responsive scaling functions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const quitGoalDaysMap: Record<string, number> = {
  '1 week': 7,
  '2 weeks': 14,
  '1 month': 30,
  '3 months': 90,
  '6 months': 180,
  'Other': 60,
};

const Onboarding12 = () => {
  const navigation = useNavigation<any>();
  const { puffCount, quitGoal } = usePuff();

  let quitInDays: number;

  if (quitGoalDaysMap[quitGoal]) {
    quitInDays = quitGoalDaysMap[quitGoal];
  } else {
    const today = new Date();
    const target = new Date(quitGoal);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    quitInDays = Math.max(diff, 7);
  }

  const preQuitPuffs = (puffCount / 2) * quitInDays;
  const postQuitPuffs = 0;
  const adjustedTotalPuffs = preQuitPuffs + postQuitPuffs;
  const adjustedCost = ((adjustedTotalPuffs / 500) * 10);

  const originalCost = ((puffCount * 365) / 500) * 10;
  const moneySaved = originalCost - adjustedCost;

  const handleContinue = () => {
    navigation.navigate('Onboarding13');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={3} totalSteps={6} />
      <View style={styles.content}>
        <View style={{ flex: 1, justifyContent: 'center', width: '100%' }}>
          <Text style={{ color: '#fff', fontSize: scale(18), textAlign: 'center', marginBottom: verticalScale(16), lineHeight: verticalScale(26) }}>
            If you stick to your goal, you could save
          </Text>
          <MaskedView maskElement={<Text style={{ fontSize: scale(48), fontWeight: 'bold', textAlign: 'center' }}>€{moneySaved.toFixed(2)}</Text>}>
            <LinearGradient
              colors={['#EF4444', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={{ fontSize: scale(48), fontWeight: 'bold', textAlign: 'center', opacity: 0 }}>€{moneySaved.toFixed(2)}</Text>
            </LinearGradient>
          </MaskedView>
          <Text style={{ color: '#fff', fontSize: scale(18), textAlign: 'center', marginTop: verticalScale(16), lineHeight: verticalScale(26) }}>
            this year alone. {'\n'}Think of what you could do with that money...
          </Text>
        </View>
        <Text style={{ color: '#aaa', fontSize: scale(13), textAlign: 'center', marginBottom: verticalScale(20), paddingHorizontal: scale(10) }}>
          Based on your daily puff count and quit goal. Again this is a rough estimate depending on the vapes you use.
        </Text>
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Learn how to Keep your money</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding12;
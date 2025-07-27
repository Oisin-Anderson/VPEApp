import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePuff } from '../context/PuffContext';
import MaskedView from '@react-native-masked-view/masked-view';
import ProgressBar from '../components/ProgressBar';
import { sharedStyles as styles, scale, verticalScale } from '../styles/choiceStyle';
import { formatCurrency, formatUSDAsLocalCurrency } from '../services/currency';

// Responsive scaling functions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Onboarding11 = () => {
  const navigation = useNavigation<any>();
  const { puffCount } = usePuff();
  const yearlyCostUSD = ((puffCount * 365) / 500) * 10;

  const handleContinue = () => {
    navigation.navigate('Onboarding12');
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={2} totalSteps={6} />
      <View style={styles.content}>
        <View style={{ flex: 1, justifyContent: 'center', width: '100%' }}>
          <Text style={{ color: '#fff', fontSize: scale(18), textAlign: 'center', marginBottom: verticalScale(16), lineHeight: verticalScale(26) }}>
            If you keep up your current vape usage, you're on track to spend
          </Text>
          <MaskedView maskElement={<Text style={{ fontSize: scale(48), fontWeight: 'bold', textAlign: 'center' }}>{formatUSDAsLocalCurrency(yearlyCostUSD)}</Text>}>
            <LinearGradient
              colors={['#EF4444', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={{ fontSize: scale(48), fontWeight: 'bold', textAlign: 'center', opacity: 0 }}>{formatUSDAsLocalCurrency(yearlyCostUSD)}</Text>
            </LinearGradient>
          </MaskedView>
          <Text style={{ color: '#fff', fontSize: scale(18), textAlign: 'center', marginTop: verticalScale(16), lineHeight: verticalScale(26) }}>
            on vapes this year. {'\n'}Yep, you read this right.
          </Text>
        </View>
        <Text style={{ color: '#aaa', fontSize: scale(13), textAlign: 'center', marginBottom: verticalScale(20), paddingHorizontal: scale(10) }}>
          Based on your daily puff count. This is a rough estimate which depends on the vapes you use.
        </Text>
      </View>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Onboarding11;
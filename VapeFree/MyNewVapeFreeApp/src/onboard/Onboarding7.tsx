import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ProgressBar from '../components/ProgressBar';
import { sharedStyles as styles, scale, verticalScale } from '../styles/choiceStyle';


const options = [
  'Less than 6 months',
  '6-12 months',
  '1-2 years',
  '2+ years',
];

const Onboarding7 = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (selected) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selected]);

  const handleContinue = () => {
    if (selected) {
      navigation.navigate('Onboarding8');
    }
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={2} totalSteps={3} />
      <View style={styles.content}>
        <Text style={styles.header}>How long have you been{'\n'}Vaping for?</Text>
        <Text style={styles.subtext}>
          This helps us understand your habits and recommend the best path forward.
        </Text>

        <View style={styles.optionContainer}>
          {options.map((option) => {
            const isSelected = selected === option;
            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.option,
                  isSelected ? styles.optionSelected : null,
                ]}
                onPress={() => setSelected(option)}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected ? styles.optionTextSelected : null,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {selected && (
        <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

export default Onboarding7;
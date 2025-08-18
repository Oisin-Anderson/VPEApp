import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { sharedStyles as styles } from '../styles/choiceStyle';


const options = [
  'Save money',
  'Improve health',
  'For my Family',
  'All of the above',
];

const Onboarding2 = () => {
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
      navigation.navigate('Onboarding3');
    }
  };

  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={3} />
      <View style={styles.content}>
        <Text style={styles.header}>Why do you want to{'\n'}Quit Vaping?</Text>
        <Text style={styles.subtext}>
          Pick the one that matters most to you.
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

export default Onboarding2;
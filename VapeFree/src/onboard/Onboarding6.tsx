import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePuff } from '../context/PuffContext'; // adjust if needed
import ProgressBar from '../components/ProgressBar';
import AsyncStorage from '@react-native-async-storage/async-storage';



const options = [
  '50',
  '100',
  '200',
  '500',
  '1000',
  'Other',
];

const Onboarding6 = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();
  const { setPuffCount } = usePuff();

  const [customValue, setCustomValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isValid, setIsValid] = useState(false);



  useEffect(() => {
    if (selected) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selected]);

  const handleContinue = async () => {
    const value =
      selected === 'Other' ? parseInt(customValue || '0', 10) : parseInt(selected || '0', 10);

    if (value > 0) {
      try {
        await AsyncStorage.setItem('avgDailyPuffs', value.toString()); // 👈 Save to AsyncStorage
      } catch (error) {
        console.error('Failed to store avgDailyPuffs:', error);
      }

      setPuffCount(value); // optional context use
      navigation.navigate('Onboarding7');
    }
  };




  return (
    <View style={styles.container}>
      <ProgressBar currentStep={1} totalSteps={3} />
      <View style={styles.content}>
        <Text style={styles.header}>What is your daily average{'\n'}Puff Count?</Text>
        <Text style={styles.subtext}>
          A rough estimate is fine — this helps us track your progress more accurately.
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
                onPress={() => {
                  if (option === 'Other') {
                    setShowModal(true);
                    setSelected(null); // avoid premature selection
                  } else {
                    setSelected(option);
                    setIsValid(true); // valid predefined number
                  }
                }}
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

        {showModal && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <ScrollView
            contentContainerStyle={styles.modalScrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Enter your daily puff count</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={customValue}
                onChangeText={(text) => {
                  setCustomValue(text);
                  const num = parseInt(text);
                  setIsValid(!isNaN(num) && num > 0);
                  if (!isNaN(num) && num > 0) setSelected('Other');
                }}
                placeholder="Enter a number"
                placeholderTextColor="#888"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={!isValid}
                  onPress={() => {
                    if (isValid) {
                      setShowModal(false);
                      handleContinue();
                    }
                  }}
                >
                  <Text style={[styles.okText, { opacity: isValid ? 1 : 0.4 }]}>OK</Text>
                </TouchableOpacity>
              </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}

      </View>

      {isValid && (
        <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

export default Onboarding6;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  header: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 34,
  },
  subtext: {
    color: '#aaaaaa',
    fontSize: 14,
    marginBottom: 30,
  },
  optionContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  option: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionSelected: {
    backgroundColor: '#ffffff',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  buttonWrapper: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: width - 48,
  },
  continueText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
    modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelText: {
    color: '#aaa',
    fontSize: 16,
  },
  okText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size; // 375 is base width (iPhone X)
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size; // 812 is base height


const options = [
  '100',
  '300',
  '600',
  'Custom Amount',
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
      selected === 'Custom Amount' ? parseInt(customValue || '0', 10) : parseInt(selected || '0', 10);

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
                  if (option === 'Custom Amount') {
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
            <View style={styles.modalContentHome}>
              <Text style={styles.modalTitleHome}>Enter your daily puff count</Text>
              <TextInput
                style={styles.inputHome}
                keyboardType="numeric"
                value={customValue}
                onChangeText={(text) => {
                  setCustomValue(text);
                  const num = parseInt(text);
                  setIsValid(!isNaN(num) && num > 0);
                  if (!isNaN(num) && num > 0) setSelected('Custom Amount');
                }}
                placeholder="500"
                placeholderTextColor="#888"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  disabled={!isValid}
                  onPress={() => {
                    if (isValid) {
                      setShowModal(false);
                      handleContinue();
                    }
                  }}
                  style={styles.saveButtonHome}
                >
                  <Text style={[styles.saveButtonTextHome, { opacity: isValid ? 1 : 0.4 }]}>OK</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: verticalScale(60),
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: scale(30),
  },
  header: {
    color: '#ffffff',
    fontSize: scale(26),
    fontWeight: 'bold',
    lineHeight: scale(34),
    marginTop: 10,
    textAlign: 'center',
  },
  subtext: {
    color: '#aaaaaa',
    fontSize: scale(14),
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionContainer: {
    width: '100%',
    marginTop: 10,
    gap: 10,
  },
  option: {
    backgroundColor: '#1a1a1a',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(20),
    borderRadius: scale(12),
    marginBottom: verticalScale(12),
  },
  optionSelected: {
    backgroundColor: '#ffffff',
  },
  optionText: {
    color: '#ffffff',
    fontSize: scale(16),
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  buttonWrapper: {
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'android' ? 60 : 30,
    paddingHorizontal: scale(30),
    width: '100%',
  },
  continueButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    borderRadius: scale(30),
    width: '100%',
  },
  continueText: {
    color: '#000',
    fontSize: scale(16),
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
    borderRadius: scale(12),
    padding: scale(24),
    width: '80%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: scale(18),
    fontWeight: '600',
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: scale(10),
    borderRadius: scale(8),
    marginBottom: verticalScale(20),
    textAlign: 'center',
    fontSize: scale(16),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelText: {
    color: '#aaa',
    fontSize: scale(16),
  },
  okText: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: '600',
  },
  modalScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentHome: {
    backgroundColor: '#1e1e1e',
    paddingVertical: verticalScale(30),
    paddingHorizontal: scale(30),
    borderRadius: scale(20),
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitleHome: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  inputHome: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: scale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(15),
    textAlign: 'center',
    fontSize: scale(16),
    backgroundColor: '#1a1a1a',
    color: '#fff',
    width: '100%',
    marginBottom: verticalScale(20),
  },
  saveButtonHome: {
    backgroundColor: '#fff',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(40),
    borderRadius: scale(30),
    marginTop: verticalScale(10),
    width: '100%',
    alignItems: 'center',
  },
  saveButtonTextHome: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});
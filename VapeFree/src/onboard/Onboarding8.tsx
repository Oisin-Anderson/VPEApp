import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { usePuff } from '../context/PuffContext';
import ProgressBar from '../components/ProgressBar';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size; // 375 is base width (iPhone X)
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size; // 812 is base height


const options = [
  '1 week',
  '1 month',
  '3 months',
  'Other(Min 1 week)',
];

const Onboarding8 = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const { setQuitGoal, puffCount } = usePuff();




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
    if (selected) {
      const quitGoalDaysMap: { [key: string]: number } = {
        '1 week': 7,
        '2 weeks': 14,
        '1 month': 30,
        '3 months': 90,
        '6 months': 180,
      };
      setQuitGoal(selected);
      navigation.navigate('Onboarding9');
    }
  };



  const handleDateConfirm = async (date: Date) => {
    const minAllowed = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
    if (date >= minAllowed) {
      setQuitGoal(date.toISOString());
      setCalendarVisible(false);
      navigation.navigate('Onboarding9');

    } else {
      alert('Please select a date at least 7 days from today.');
    }
  };


  return (
    <View style={styles.container}>
      <ProgressBar currentStep={3} totalSteps={3} />
      <View style={styles.content}>
        <Text style={styles.header}>When would you like to be Vape Free?</Text>
        <Text style={styles.subtext}>
          Setting a goal helps you commit, even if it’s weeks or months away.
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
                  if (option === 'Other(Min 1 week)') {
                    setCalendarVisible(true);
                    setSelected(null); // avoid premature selection
                  } else {
                    setSelected(option);
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
      </View>
      {selected && selected !== 'Other(Min 1 week)' && (
        <Animated.View style={[styles.buttonWrapper, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <DateTimePickerModal
        isVisible={isCalendarVisible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setCalendarVisible(false)}
        minimumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        themeVariant={Platform.OS === 'ios' ? 'light' : 'dark'}
      />
    </View>
    
  );
};

export default Onboarding8;

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
});
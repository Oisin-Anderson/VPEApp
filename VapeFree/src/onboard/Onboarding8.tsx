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



const options = [
  '1 week',
  '2 weeks',
  '1 month',
  '3 months',
  '6 months',
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
        <Text style={styles.header}>When would you like to be{'\n'}Vape Free?</Text>
        <Text style={styles.subtext}>
          Setting a goal helps you commit — even if it’s weeks or months away.
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
        themeVariant="dark"
      />
    </View>
    
  );
};

export default Onboarding8;

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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
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
});
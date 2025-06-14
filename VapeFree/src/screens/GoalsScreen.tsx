import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { LineChart } from 'react-native-chart-kit';
import { usePuff } from '../context/PuffContext';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Explicitly define the render function type
type RenderFunction = (remainingTime: number) => React.ReactNode;


const QuitPlanApp = () => {
  const { puffCount: homePuffCount } = usePuff();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(true); // Force modal on initial load
  const [targetDate, setTargetDate] = useState(() => {
    const now = new Date();
    now.setDate(now.getDate() + 30); // Default to 30 days from now
    return now;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [puffCount, setPuffCount] = useState('');
  const [quitDateStored, setQuitDateStored] = useState(false);
  const [puffsToday, setPuffToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  useEffect(() => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    console.log('Initial diff:', diff, 'targetDate:', targetDate, 'now:', now); // Debug log
    if (diff <= 0 && !quitDateStored) {
      setShowModal(true);
      setTimeLeft(0);
    } else if (diff > 0) {
      setTimeLeft(Math.floor(diff / 1000));
    }
    setIsLoading(false); // Set loading to false after initial calculation
  }, [targetDate, quitDateStored]);

  useEffect(() => {
    if (quitDateStored && timeLeft !== null) {
      const updateCountdown = () => {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        if (diff > 0) {
          setTimeLeft(Math.floor(diff / 1000));
        } else {
          setTimeLeft(0);
        }
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [quitDateStored, timeLeft, targetDate]);

  const [puffHistoryData, setPuffHistoryData] = useState<number[]>([]);

  useEffect(() => {
    const loadPuffData = async () => {
    try {
      const planData = await AsyncStorage.getItem('quitPlanData');
      if (!planData) return;

      const { targetDate } = JSON.parse(planData);
      const endDate = new Date(targetDate);

      // Calculate quit start date:
      const totalDays = Math.ceil((endDate.getTime() - Date.now()) / 86400000) + 1;
      const startDate = new Date(endDate);
      startDate.setDate(endDate.getDate() - (totalDays - 1));
      

      const newData: number[] = [];

      for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];

        const json = await AsyncStorage.getItem(`puffTimes-${dateStr}`);
        if (json) {
          try {
            const entries = JSON.parse(json);
            newData.push(Array.isArray(entries) ? entries.length : 0);
          } catch {
            newData.push(0);
          }
        } else {
          newData.push(0);
        }
      }

      setPuffHistoryData(newData);
    } catch (err) {
      console.warn('Error loading puff history for graph:', err);
    }
  };

    if (quitDateStored && timeLeft !== null) {
      loadPuffData();
    }
  }, [targetDate, timeLeft, quitDateStored]);

  useEffect(() => {
    const validPuffCount = typeof homePuffCount === 'number' && !isNaN(homePuffCount) ? homePuffCount : 0;
    setPuffToday(validPuffCount);
  }, [homePuffCount]);

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || targetDate;
    const now = new Date();
    if (currentDate.getTime() <= now.getTime()) {
      alert('Please select a future date.');
      return;
    }
    setShowDatePicker(false);
    setTargetDate(currentDate);
  };

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const json = await AsyncStorage.getItem('quitPlanData');
        if (json) {
          const data = JSON.parse(json);
          if (data.targetDate) {
            const parsedDate = new Date(data.targetDate);
            setTargetDate(parsedDate);
            const now = new Date();
            const diff = parsedDate.getTime() - now.getTime();
            setTimeLeft(diff > 0 ? Math.floor(diff / 1000) : 0);
          }
          if (data.puffCount !== undefined) {
            setPuffCount(data.puffCount.toString());
          }
          if (data.quitDateStored) {
            setQuitDateStored(true);
            setShowModal(false); // hide intro modal if data exists
          }
        }
      } catch (err) {
        console.error('Failed to load quit plan data:', err);
      }
    };

    loadStoredData();
  }, []);

  const resetData = async () => {
    await AsyncStorage.removeItem('quitPlanData');
    setShowModal(true);
    setShowSecondModal(false);
    setQuitDateStored(false);
    setPuffCount('');
    setTargetDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // Optional: reset to 30 days ahead
    setTimeLeft(null); // 🧼 Reset the timer countdown
  };


  const addDays = (days: number) => {
    const newDate = new Date(targetDate);
    newDate.setDate(newDate.getDate() + days);
    setTargetDate(newDate);
  };

  const formatTime = (time: number) => {
    if (time <= 0 || isNaN(time)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(time / (3600 * 24));
    const hours = Math.floor((time % (3600 * 24)) / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return { days, hours, minutes, seconds };
  };

  const handleNext = () => {
    setQuitDateStored(true);
    setShowModal(false);
    setShowSecondModal(true);
  };

  const handleFinish = async () => {
    const count = parseInt(puffCount, 10);
    if (isNaN(count) || count <= 0) {
      alert('Please enter a valid starting puff count.');
      return;
    }

    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    if (diff > 0) {
      setTimeLeft(Math.floor(diff / 1000));
    }

    setShowSecondModal(false);
    setQuitDateStored(true);

    // ✅ Save data
    try {
      await AsyncStorage.setItem('quitPlanData', JSON.stringify({
        puffCount: count,
        targetDate: targetDate.toISOString(),
        quitDateStored: true,
      }));
    } catch (error) {
      console.error('Failed to save quit plan data:', error);
    }
  };

  const chartWidth = 350;
  const totalDays = useMemo(() => {
    const now = new Date();
    const msDiff = targetDate.getTime() - now.getTime();
    return Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));
  }, [targetDate]);
  const puffCountNum = useMemo(() => {
    const n = parseInt(puffCount, 10);
    return isNaN(n) ? 0 : n;
  }, [puffCount]);

  
  const puffLimitData = Array.from({ length: totalDays }, (_, i) => {
    const t = i / (totalDays - 1); // goes from 0 to 1
    const eased = 1 - Math.pow(t, 2); // quadratic easing (slow start)
    return Math.round(eased * puffCountNum);
  });

  const todayLimit = puffLimitData[0] ?? 0;

  /*const sampledPuffLimitData = useMemo(() => {
    return Array.from({ length: numPoints }, (_, i) => {
      const index = Math.floor((i * (totalDays - 1)) / (numPoints - 1));
      const val = puffLimitData[index];
      return isNaN(val) ? 0 : val;
    });
  }, [totalDays, puffLimitData]);*/

  const puffEnteredData = useMemo(() => {
    const padded = puffHistoryData.length === totalDays
      ? puffHistoryData
      : Array(totalDays).fill(0).map((_, i) => puffHistoryData[i] ?? 0);

    return padded; // reverse so today is Day 30, then 29, 28, ...
  }, [puffHistoryData, totalDays]);


  const handleTimerReset = useCallback((shouldReset: boolean, setKey: React.Dispatch<React.SetStateAction<number>>) => {
    if (shouldReset) {
      setKey(prev => prev + 1);
    }
    return { shouldRepeat: shouldReset, delay: 1000 };
  }, []);

  const timeComponents = timeLeft !== null ? formatTime(timeLeft) : formatTime(0);
  const { days, hours, minutes, seconds } = timeComponents;

  const renderTimers = timeLeft !== null && !isNaN(timeLeft) && timeLeft > 0 && !isLoading;

  const graphDataReady =
  totalDays > 0 &&
  puffLimitData.length === totalDays &&
  puffEnteredData.length === totalDays &&
  puffLimitData.every(n => typeof n === 'number' && !isNaN(n)) &&
  puffEnteredData.every(n => typeof n === 'number' && !isNaN(n));

  const labelCount = 7;
  const labelStep = Math.floor(totalDays / (labelCount - 1));

  // Generate labels like [30, 25, 20, ..., 5]
  let labelValues = Array.from({ length: labelCount - 1 }, (_, i) =>
    totalDays - i * labelStep
  );

  // Add Day 1 instead of Day 0
  if (!labelValues.includes(1)) {
    labelValues.push(1);
  }

  // Remove duplicates and sort descending to ascending for alignment
  labelValues = [...new Set(labelValues)].sort((a, b) => b - a);

  // Build full labels array (1 label per graph point)
  const labels = Array.from({ length: totalDays }, (_, i) => {
    const dayLeft = totalDays - i; // index 0 = Day 30
    return labelValues.includes(dayLeft) ? dayLeft.toString() : '';
  });





  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{color: `rgba(0, 255, 0, 1)`}}>Limit today: {todayLimit} puffs</Text>
        <Text style={{color: `rgba(255, 0, 0, 1)`}}>Puffs today: {puffsToday} puffs</Text>
      </View>
      <TouchableOpacity style={styles.nextButton} onPress={resetData}>
        <Text style={styles.nextButtonText}>Reset Plan</Text>
      </TouchableOpacity>
      <View style={styles.timerContainer}>
        <Text style={styles.timerTitle}>Countdown Timer</Text>
        {renderTimers ? (
          <View style={styles.cardRow}>
            <View style={styles.timerCard}>
              <Text style={styles.cardNumber}>{days}</Text>
              <Text style={styles.cardLabel}>Days</Text>
            </View>
            <View style={styles.timerCard}>
              <Text style={styles.cardNumber}>{hours}</Text>
              <Text style={styles.cardLabel}>Hours</Text>
            </View>
            <View style={styles.timerCard}>
              <Text style={styles.cardNumber}>{minutes}</Text>
              <Text style={styles.cardLabel}>Minutes</Text>
            </View>
            <View style={styles.timerCard}>
              <Text style={styles.cardNumber}>{seconds}</Text>
              <Text style={styles.cardLabel}>Seconds</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.errorText}>Set a future quit date to start the timer</Text>
        )}
      </View>

      <View style={styles.graphContainer}>
       <Text style={styles.graphTitle}>Puff Reduction Plan</Text>
        {graphDataReady ? (
          
          <LineChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: puffLimitData,
                  color: (opacity = 1) => `rgba(0, 255, 0, 1)`,
                  strokeWidth: 2,
                },
                {
                  data: puffEnteredData,
                  color: (opacity = 1) => `rgba(255, 0, 0, 1)`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={chartWidth}
            height={220}
            yAxisLabel=""
            withDots={false}
            withInnerLines={false}  // removes inside grid lines
            withOuterLines={false}  // removes outer edge lines
            //withDots={false} // removes bullet points from lines
            chartConfig={{
              backgroundColor: '#030303',
              backgroundGradientFrom: '#000000',
              backgroundGradientTo: '#010101',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />


        ) : (
          <Text style={styles.errorText}>Loading graph data...</Text>
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set a Quit Date</Text>
            <Text style={styles.modalText}>
              This is the day you'll quit for good! Setting a date increases the likelihood you'll meet your goal.
            </Text>
            <Text style={styles.modalSubText}>
              Choose a date that's realistic and achievable based on your current intake.
            </Text>
            <Text style={styles.dateLabel}>Choose your Quit Date</Text>
            <Pressable onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={styles.dateInput}
                value={targetDate.toLocaleDateString()}
                editable={false}
              />
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={targetDate}
                minimumDate={new Date()}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            <Text style={styles.orText}>or</Text>
            <View style={styles.quickOptions}>
              <TouchableOpacity style={styles.optionButton} onPress={() => addDays(30)}>
                <Text>30 days</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => addDays(90)}>
                <Text>90 days</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.optionButton} onPress={() => addDays(365)}>
                <Text>365 days</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButton}><Text style={{ color: 'white', fontWeight: 'bold' }}>Next</Text></Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showSecondModal}
        onRequestClose={() => setShowSecondModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Starting Count</Text>
            <Text style={styles.modalText}>
              Your starting count is a benchmark that the Quit Plan will use to help you quit.
            </Text>
            <Text style={styles.modalSubText}>
              Every day this number will decrease as you move toward your Quit Date, until completely quit.
            </Text>
            <Text style={styles.puffLabel}>How many puffs do you currently take Daily?</Text>
            <TextInput
              style={styles.puffInput}
              value={puffCount}
              onChangeText={setPuffCount}
              keyboardType="numeric"
              placeholder="Puffs"
            />
            <Text style={styles.recommendText}>
              We recommend logging at least one day of puffs in order to get an accurate count to start your plan with
            </Text>
            <TouchableOpacity style={styles.nextButton} onPress={handleFinish}>
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#000000', justifyContent: 'center', color: '#ffffff' },
  header: { alignItems: 'center', marginBottom: 20, color: '#ffffff' },
  timerContainer: { alignItems: 'center', marginBottom: 20 },
  timerTitle: { fontSize: 18, marginBottom: 10, color: '#ffffff' },
  timerRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  timerCircle: { alignItems: 'center' },
  timerText: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' },
  timerLabel: { fontSize: 10, color: '#666' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#ffffff' },
  modalText: { fontSize: 14, marginBottom: 10, color: '#ffffff' },
  modalSubText: { fontSize: 12, color: '#ffffff', marginBottom: 20 },
  dateLabel: { fontSize: 16, marginBottom: 10, color: '#ffffff' },
  dateInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 20 },
  orText: { textAlign: 'center', marginVertical: 10, color: '#ffffff' },
  quickOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  optionButton: { padding: 10, backgroundColor: '#e0e0e0', borderRadius: 5 },
  nextButton: { backgroundColor: `rgba(0, 255, 0, 1)`, padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  puffLabel: { fontSize: 16, marginBottom: 10, color: '#ffffff' },
  puffInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 20, textAlign: 'center' },
  recommendText: { fontSize: 12, color: '#ffffff', marginBottom: 20 },
  graphContainer: { marginVertical: 20, alignItems: 'center' },
  graphTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#ffffff' },
  errorText: { color: 'red', textAlign: 'center' },
  nextButtonText: { color: 'black', fontWeight: 'bold', textAlign: 'center', },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  timerCard: {
    alignItems: 'center',
    backgroundColor: '#020202',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    width: 70,
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardLabel: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 5,
  },
});

export default QuitPlanApp;
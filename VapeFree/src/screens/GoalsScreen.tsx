import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { LineChart } from 'react-native-chart-kit';
import { usePuff } from '../context/PuffContext';
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
  const [dayKey, setDayKey] = useState(0);
  const [hourKey, setHourKey] = useState(0);
  const [minuteKey, setMinuteKey] = useState(0);
  const [secondKey, setSecondKey] = useState(0);
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
        console.log('Countdown diff:', diff, 'timeLeft:', timeLeft); // Debug log
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
  const totalDays = timeLeft !== null ? Math.max(1, Math.ceil(timeLeft / 86400) + 1) : 1;
  const puffCountNum = puffCount ? parseInt(puffCount, 10) : 0;
  const puffLimitData = Array.from({ length: totalDays }, (_, i) => {
    const t = i / (totalDays - 1); // goes from 0 to 1
    const eased = 1 - Math.pow(t, 2); // quadratic easing (slow start)
    return Math.round(eased * puffCountNum);
  });

  const todayLimit = puffLimitData[0] ?? 0;

  const numPoints = 10;
  const labels = Array.from({ length: numPoints }, (_, i) => {
    const index = Math.floor((i * (totalDays - 1)) / (numPoints - 1));
    return index.toString();
  });
  const sampledPuffLimitData = useMemo(() => {
    return Array.from({ length: numPoints }, (_, i) => {
      const index = Math.floor((i * (totalDays - 1)) / (numPoints - 1));
      const val = puffLimitData[index];
      console.log('sampledPuffLimitData', sampledPuffLimitData);
      return isNaN(val) ? 0 : val;
    });
  }, [totalDays, puffLimitData]);

  const sampledPuffsEnteredData = useMemo(() => {
    return Array.from({ length: numPoints }, (_, i) => {
      return i === 0 ? puffsToday : 0; // ✅ Avoid NaN or null
    });
  }, [puffsToday]);

  const handleTimerReset = useCallback((shouldReset: boolean, setKey: React.Dispatch<React.SetStateAction<number>>) => {
    if (shouldReset) {
      setKey(prev => prev + 1);
    }
    return { shouldRepeat: shouldReset, delay: 1000 };
  }, []);

  const timeComponents = timeLeft !== null ? formatTime(timeLeft) : formatTime(0);
  const { days, hours, minutes, seconds } = timeComponents;

  const renderTimers = timeLeft !== null && !isNaN(timeLeft) && timeLeft > 0 && !isLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>Limit today: {todayLimit} puffs</Text>
        <Text>Puffs today: {puffsToday} puffs</Text>
      </View>
      <TouchableOpacity style={styles.nextButton} onPress={resetData}>
        <Text style={styles.nextButtonText}>Reset Plan</Text>
      </TouchableOpacity>
      <View style={styles.timerContainer}>
        <Text style={styles.timerTitle}>Countdown Timer</Text>
        {renderTimers ? (
          <View style={styles.timerRow}>
            <View style={styles.timerCircle}>
              <CountdownCircleTimer
                key={dayKey}
                isPlaying
                duration={days * 86400}
                initialRemainingTime={days * 86400}
                colors={['#004777', '#F7B801', '#A30000']}
                colorsTime={[24, 12, 0]}
                size={60}
                onComplete={() => {
                  setDayKey(prev => prev + 1);  // 🔁 Reset timer key to restart animation
                  return { shouldRepeat: timeLeft > 0, delay: 0 }; // ✅ Optional delay before repeat
                }}
              >
                {() => <Text style={styles.timerText}>{days}</Text>}
              </CountdownCircleTimer>
              <Text style={styles.timerLabel}>day</Text>
            </View>
            <View style={styles.timerCircle}>
              <CountdownCircleTimer
                key={hourKey}
                isPlaying
                duration={86400}
                initialRemainingTime={86400}
                colors={['#004777', '#F7B801', '#A30000']}
                colorsTime={[24, 12, 0]}
                size={60}
                
                onComplete={() => {
                  setHourKey(prev => prev + 1);  // 🔁 Reset timer key to restart animation
                  return { shouldRepeat: timeLeft > 0, delay: 0 }; // ✅ Optional delay before repeat
                }}
              >
                {() => <Text style={styles.timerText}>{hours}</Text>}
              </CountdownCircleTimer>
              <Text style={styles.timerLabel}>hr</Text>
            </View>
            <View style={styles.timerCircle}>
              <CountdownCircleTimer
                key={minuteKey}
                isPlaying
                duration={3600}
                initialRemainingTime={3600}
                colors={['#004777', '#F7B801', '#A30000']}
                colorsTime={[60, 30, 0]}
                size={60}
                
                onComplete={() => {
                  setMinuteKey(prev => prev + 1);  // 🔁 Reset timer key to restart animation
                  return { shouldRepeat: timeLeft > 0, delay: 0 }; // ✅ Optional delay before repeat
                }}
              >
                {() => <Text style={styles.timerText}>{minutes}</Text>}
              </CountdownCircleTimer>
              <Text style={styles.timerLabel}>min</Text>
            </View>
            <View style={styles.timerCircle}>
              <CountdownCircleTimer
                key={secondKey}
                isPlaying
                duration={60}
                initialRemainingTime={60}
                colors={['#004777', '#F7B801', '#A30000']}
                colorsTime={[60, 30, 0]}
                size={60}
                onComplete={() => {
                  setSecondKey(prev => prev + 1);  // 🔁 Reset timer key to restart animation
                  return { shouldRepeat: timeLeft > 0, delay: 0 }; // ✅ Optional delay before repeat
                }}
              >
                {() => <Text style={styles.timerText}>{seconds}</Text>}
              </CountdownCircleTimer>
              <Text style={styles.timerLabel}>sec</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.errorText}>Set a future quit date to start the timer</Text>
        )}
      </View>

      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Puff Reduction Plan</Text>
        {totalDays > 0 && sampledPuffLimitData.length === numPoints && sampledPuffsEnteredData.length === numPoints ? (
          <LineChart
            data={{
              labels: labels,
              datasets: [
                {
                  data: sampledPuffLimitData,
                  color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: sampledPuffsEnteredData,
                  color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
            }}
            width={chartWidth}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            //bezier
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
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5', justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  timerContainer: { alignItems: 'center', marginBottom: 20 },
  timerTitle: { fontSize: 18, marginBottom: 10 },
  timerRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  timerCircle: { alignItems: 'center' },
  timerText: { fontSize: 14, fontWeight: 'bold' },
  timerLabel: { fontSize: 10, color: '#666' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 14, marginBottom: 10 },
  modalSubText: { fontSize: 12, color: '#666', marginBottom: 20 },
  dateLabel: { fontSize: 16, marginBottom: 10 },
  dateInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 20 },
  orText: { textAlign: 'center', marginVertical: 10 },
  quickOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  optionButton: { padding: 10, backgroundColor: '#e0e0e0', borderRadius: 5 },
  nextButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
  puffLabel: { fontSize: 16, marginBottom: 10 },
  puffInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 20, textAlign: 'center' },
  recommendText: { fontSize: 12, color: '#666', marginBottom: 20 },
  graphContainer: { marginVertical: 20, alignItems: 'center' },
  graphTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  errorText: { color: 'red', textAlign: 'center' },
  nextButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', }
});

export default QuitPlanApp;
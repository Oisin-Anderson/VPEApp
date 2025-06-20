import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { usePuff } from '../context/PuffContext';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Explicitly define the render function type
type RenderFunction = (remainingTime: number) => React.ReactNode;

const generateEasedDropPlan = (initial: number, totalDays: number): number[] => {
  const steps: number[] = [initial];
  let current = initial;
  let day = 1;

  const lastThirdStart = Math.floor(totalDays * 2 / 3);
  const taperTarget = Math.floor(initial / 5); // want to reach this by start of last third

  // Phase 1–2: smoother, slightly random descent to taperTarget
  while (day < lastThirdStart) {
    const daysLeftToTaper = lastThirdStart - day;
    const toDrop = current - taperTarget;
    const avgDrop = Math.max(1, Math.floor(toDrop / daysLeftToTaper));

    // Add random offset to make it uneven but not jagged
    const randomOffset = Math.floor(Math.random() * 3) - 1; // -1 to +1
    const drop = Math.max(1, avgDrop + randomOffset);

    const holdDays = Math.min(daysLeftToTaper, Math.floor(Math.random() * 2) + 1); // 1–2 day hold

    current = Math.max(taperTarget, current - drop);

    for (let i = 0; i < holdDays && day < lastThirdStart; i++) {
      steps.push(current);
      day++;
    }
  }

  // Phase 3: taper to 0 with smaller, more random steps
  // Phase 3: taper to 0 with varied flat + random drops
const remainingDays = totalDays - day;
const totalDrop = current;
let stepsRemaining = remainingDays;
let finalPlan: number[] = [];

while (stepsRemaining > 1) {
  const shouldHold = Math.random() < 0.3; // 30% chance to hold
  if (shouldHold) {
    finalPlan.push(current); // no drop today
    stepsRemaining--;
    day++;
    continue;
  }

  // If dropping, decide drop size (1–3) but don't overshoot
  const maxDrop = Math.min(current, Math.floor(totalDrop / stepsRemaining) + 2);
  const drop = Math.max(1, Math.floor(Math.random() * maxDrop) + 1);

  current = Math.max(0, current - drop);
  finalPlan.push(current);
  stepsRemaining--;
  day++;
}

// Ensure the last day is 0
finalPlan.push(0);
steps.push(...finalPlan);

return steps;
};






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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [storedPuffLimitData, setStoredPuffLimitData] = useState<number[]>([]);



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

      if (!startDate) return;
      const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000) + 1;

      

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
  }, [targetDate, timeLeft, quitDateStored, startDate]);

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

          if (data.startDate) {
            const parsedStart = new Date(data.startDate); // ✅ Load start date
            setStartDate(parsedStart);
          }

          if (data.puffCount !== undefined) {
            setPuffCount(data.puffCount.toString());
          }

          if (data.quitDateStored) {
            setQuitDateStored(true);
            setShowModal(false);
          }

          if (data.puffLimitData) {
            setStoredPuffLimitData(data.puffLimitData); // ✅ this is the correct key
          }


        }
      } catch (err) {
        console.error('Failed to load quit plan data:', err);
      }

      setIsLoading(false);
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
    setStoredPuffLimitData([]); // ✅ clears the stored line in memory
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
    if (quitDateStored) return; // ✅ Guard: don't regenerate if plan already exists

    const count = parseInt(puffCount, 10);
    if (isNaN(count) || count <= 0) {
      alert('Please enter a valid starting puff count.');
      return;
    }

    const startDate = new Date(); // ✅ define a local startDate (same as `now`)
    const totalDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / 86400000) + 1;

    // ✅ Generate puff limit data
    const generatedPuffLimitData = generateEasedDropPlan(count, totalDays);





    // ✅ Store it in AsyncStorage
    await AsyncStorage.setItem('quitPlanData', JSON.stringify({
      puffCount: count,
      targetDate: targetDate.toISOString(),
      startDate: startDate.toISOString(),         // ✅ save it properly
      puffLimitData: generatedPuffLimitData,      // ✅ save precomputed data
      quitDateStored: true,
    }));
    setStoredPuffLimitData(generatedPuffLimitData); // ✅ Immediately use the new plan


    setShowSecondModal(false);
    setQuitDateStored(true);
    setTimeLeft(Math.floor((targetDate.getTime() - startDate.getTime()) / 1000)); // use the same base
    setStartDate(startDate); // ✅ update the state too so it's ready for calculations
  };




  const chartWidth = 350;
  const totalDays = useMemo(() => {
    if (!startDate || !targetDate) return 0;
    const diff = targetDate.getTime() - startDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }, [startDate, targetDate]);


  const puffCountNum = useMemo(() => {
    const n = parseInt(puffCount, 10);
    return isNaN(n) ? 0 : n;
  }, [puffCount]);


  const fallbackRandomizedSteps = useMemo(() => {
    return generateEasedDropPlan(puffCountNum, totalDays);
  }, [puffCountNum, totalDays]);



  
  const puffLimitData = useMemo(() => {
    if (isLoading) return [];

    if (storedPuffLimitData.length > 0 && storedPuffLimitData.every(n => typeof n === 'number')) {
      return storedPuffLimitData; // ✅ freeze from stored version
    }
    console.warn('⚠️ Using fallback! puffLimitData was missing or corrupted.');
    return fallbackRandomizedSteps; // ❌ only runs if no stored data (dev safety)
  }, [storedPuffLimitData]);



  const todayIndex = useMemo(() => {
    if (!startDate) return 0;
    const now = new Date();

    const truncateToDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const daysPassed = Math.floor(
      (truncateToDate(new Date()).getTime() - truncateToDate(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    
    return Math.min(daysPassed, puffLimitData.length - 1);
  }, [startDate, puffLimitData.length]);

  const todayLimit = puffLimitData[todayIndex] ?? 0;


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
  // Generate label day values (e.g., 30, 25, ..., 1, 0)
  let labelValues = Array.from({ length: labelCount - 1 }, (_, i) =>
    totalDays - 1 - i * labelStep
  );

  // Always include Day 0
  if (!labelValues.includes(0)) {
    labelValues.push(0);
  }

  labelValues = [...new Set(labelValues)].sort((a, b) => b - a);

  const labels = Array.from({ length: totalDays }, (_, i) => {
    const dayLeft = totalDays - 1 - i; // index 0 = highest day, end = 0
    return labelValues.includes(dayLeft) ? dayLeft.toString() : '';
  });



  if (!quitDateStored) {
    return (
      <ScrollView contentContainerStyle={styles.onboardingContainer}>
        <Text style={styles.modalTitle}>Start Your Quit Plan</Text>
        <Text style={styles.modalText}>
          The best way to quit is to set a goal and reduce slowly overtime. We've set it to 30 days but feel free to extend your quit date.
        </Text>
        <Text style={styles.modalSubText}>
          Choose a realistic Quit Date and your current daily puff count.
        </Text>

        <Text style={styles.dateLabel}>Pick Your Quit Date</Text>
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

        <Text style={styles.orText}>Quick Options</Text>
        <View style={styles.quickOptions}>
          <TouchableOpacity style={styles.optionButton} onPress={() => addDays(30)}>
            <Text>30 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => addDays(90)}>
            <Text>90 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={() => addDays(365)}>
            <Text>365 Days</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.puffLabel}>How many puffs do you take daily?</Text>
        <TextInput
          style={styles.puffInput}
          value={puffCount}
          onChangeText={setPuffCount}
          keyboardType="numeric"
          placeholder="Puffs"
        />

        <Text style={styles.recommendText}>
          We recommend tracking your puffs for a day or two before entering here to get a better plan.
        </Text>

        <TouchableOpacity style={styles.nextButton} onPress={handleFinish}>
          <Text style={styles.nextButtonText}>Generate My Quit Plan</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }




  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.appTitle}>
          <Text style={styles.freeText}>Puff</Text>
          <Text style={styles.vapeText}>Daddy</Text>
        </Text>
      </View>
      <View style={styles.header}>
        <Text style={{color: `#0088cc`}}>Limit today: {todayLimit} puffs</Text>
        <Text style={{color: `#E50000`}}>Puffs today: {puffsToday} puffs</Text>
      </View>
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
                  color: (opacity = 1) => `#0088cc`,
                  strokeWidth: 2,
                },
                {
                  data: puffEnteredData,
                  color: (opacity = 1) => '#e50000',
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
            segments={5}
            chartConfig={{
              backgroundColor: '#161618',
              backgroundGradientFrom: '#161618',
              backgroundGradientTo: '#161618',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `#ffffff`,  // Axis labels
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

      
      <TouchableOpacity style={styles.nextButton} onPress={resetData}>
        <Text style={styles.nextButtonText}>Reset Plan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 40, backgroundColor: '#000000', alignItems: 'center' },
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
  dateInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 20, color: '#ffffff' },
  orText: { textAlign: 'center', marginVertical: 10, color: '#ffffff' },
  quickOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  optionButton: { padding: 10, backgroundColor: '#e0e0e0', borderRadius: 5 },
  nextButton: { backgroundColor: `#e50000`, padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 10 },
  puffLabel: { fontSize: 16, marginBottom: 10, color: '#ffffff' },
  puffInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 20, textAlign: 'center', color: '#ffffff' },
  recommendText: { fontSize: 12, color: '#ffffff', marginBottom: 20 },
  graphContainer: { marginVertical: 20, alignItems: 'center', },
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
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  vapeText: {
    color: '#FF3333',
  },
  freeText: {
    color: '#FFFFFF',
  },
  titleContainer: {
    marginBottom: 20,
  },
  onboardingContainer: {
    flexGrow: 1,
    backgroundColor: '#000000',
    padding: 20,
    justifyContent: 'center',
  },

});

export default QuitPlanApp;
import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Pressable, TextInput, Animated, Easing, InteractionManager, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LineChart } from 'react-native-chart-kit';
import { usePuff } from '../context/PuffContext';
import { ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import Progress from './Progress'; // adjust path if needed


const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;

// Explicitly define the render function type
type RenderFunction = (remainingTime: number) => React.ReactNode;

const generateAggressiveStartPlan = (totalDays: number, startPuffs: number): number[] => {
  if (totalDays <= 1) return [0];

  // 🧪 Simple fallback if starting puffs are very low
  if (startPuffs < 5) {
    const plan: number[] = [];
    const stepDown = startPuffs / (totalDays - 1);

    for (let day = 0; day < totalDays - 1; day++) {
      const puffs = Math.round(startPuffs - stepDown * day);
      plan.push(Math.max(puffs, 1)); // keep at least 1 until final day
    }

    plan.push(0); // Final day
    plan[0] = startPuffs;
    plan[plan.length - 1] = 0;

    return plan;
  }

  // ✅ Normal strategy for startPuffs >= 5
  const numberOfSteps = Math.min(10, totalDays - 1);
  const plan: number[] = [];

  const stepDownAmount = startPuffs / numberOfSteps;
  const weights: number[] = Array.from({ length: numberOfSteps }, (_, i) => Math.pow(i + 1, 2));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const stepLengths = weights.map(w => Math.round((w / totalWeight) * (totalDays - 1)));

  let totalAssigned = stepLengths.reduce((sum, len) => sum + len, 0);
  while (totalAssigned > totalDays - 1) {
    for (let i = stepLengths.length - 1; i >= 0 && totalAssigned > totalDays - 1; i--) {
      if (stepLengths[i] > 1) {
        stepLengths[i]--;
        totalAssigned--;
      }
    }
  }
  while (totalAssigned < totalDays - 1) {
    for (let i = 0; i < stepLengths.length && totalAssigned < totalDays - 1; i++) {
      stepLengths[i]++;
      totalAssigned++;
    }
  }

  for (let step = 0; step < numberOfSteps; step++) {
    const puffsThisStep = Math.round(startPuffs - step * stepDownAmount);
    for (let i = 0; i < stepLengths[step]; i++) {
      plan.push(puffsThisStep);
    }
  }

  plan.push(0);
  plan[0] = startPuffs;
  plan[plan.length - 1] = 0;

  return plan;
};










type GoalsScreenProps = {
  onReset?: () => void;
  onHardReset?: () => void;
};

const GoalsScreen = React.forwardRef((props: GoalsScreenProps, ref) => {
  const { onReset, onHardReset } = props;

  const { puffCount: homePuffCount } = usePuff();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(true); // Force modal on initial load
  const [targetDate, setTargetDate] = useState(() => {
    const now = new Date();
    now.setDate(now.getDate() + 7); // ✅ default to 7 days from now
    return now;
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [puffCount, setPuffCount] = useState('');
  const [quitDateStored, setQuitDateStored] = useState(false);
  const [puffsToday, setPuffToday] = useState(0);
  const [loading, setLoading] = useState(true); // Add loading state
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [storedPuffLimitData, setStoredPuffLimitData] = useState<number[]>([]);
  const navigation = useNavigation() as any;
  const [puffsTodayColor, setPuffsTodayColor] = useState('#ffffff');
  const isFocused = useIsFocused();
  const [planPage, setPlanPage] = useState(0);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);





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
  }, [targetDate, quitDateStored]);

  useEffect(() => {
    if (quitDateStored) {
      const updateCountdown = () => {
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        setTimeLeft(diff > 0 ? Math.floor(diff / 1000) : 0);
      };

      updateCountdown(); // run once immediately
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [quitDateStored, targetDate]); // ✅ removed timeLeft from deps


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

        setPuffHistoryData(newData.reverse()); // reverse here
      } catch (err) {
        console.warn('Error loading puff history for graph:', err);
      }
    };

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

    };

    InteractionManager.runAfterInteractions(() => {
      setLoading(true);
      Promise.all([
        loadPuffData(),
        loadStoredData()
      ]).finally(() => setLoading(false));
    });
  }, [puffCount]); // Also run when puffCount changes


  useEffect(() => {
    const validPuffCount = typeof homePuffCount === 'number' && !isNaN(homePuffCount) ? homePuffCount : 0;
    setPuffToday(validPuffCount);
  }, [homePuffCount]);

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || targetDate;
    const now = new Date();
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 6);
    
    if (currentDate < minDate) {
      alert('Please select a future date.');
      return;
    }
    setShowDatePicker(false);
    setTargetDate(currentDate);
  };

  useEffect(() => {
    if (!quitDateStored && planPage !== 0) {
      setPlanPage(0);
    }
  }, [quitDateStored]);







  const resetData = async () => {
    // Remove all puffTimes-YYYY-MM-DD keys for the previous plan's date range, except today
    try {
      const planData = await AsyncStorage.getItem('quitPlanData');
      if (planData) {
        const { startDate: prevStart, targetDate: prevTarget } = JSON.parse(planData);
        if (prevStart && prevTarget) {
          const start = new Date(prevStart);
          const end = new Date(prevTarget);
          const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
          const todayStr = new Date().toISOString().split('T')[0];
          for (let i = 0; i < days; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            if (dateStr !== todayStr) {
              await AsyncStorage.removeItem(`puffTimes-${dateStr}`);
            }
          }
        }
      }
    } catch (err) {
      // ignore errors
    }
    await AsyncStorage.removeItem('quitPlanData');

    setShowModal(false); // Force close first
    setShowSecondModal(false);
    setQuitDateStored(false);
    setPuffCount('');
    setStoredPuffLimitData([]);
    // Do NOT clear today's puff history data
    setTargetDate(() => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7);
      return newDate;
    });
    setTimeLeft(null);

    if (onHardReset) {
      onHardReset(); // ⬅️ trigger full remount
      // Do not return here, always show onboarding after reset
    }

    setTimeout(() => {
      setPlanPage(0);
      setShowModal(true);
    }, 0); // 🔁 triggers clean remount
  };



  const addDays = (days: number) => {
    const newDate = new Date();
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
    const generatedPuffLimitData = generateAggressiveStartPlan(totalDays, count);


    if (!generatedPuffLimitData || generatedPuffLimitData.length === 0 || !generatedPuffLimitData.every(n => typeof n === 'number')) {
      console.warn('🚨 Invalid puffLimitData — aborting save');
      return;
    }





    // ✅ Store it in AsyncStorage
    const reversedPlan = generatedPuffLimitData.slice().reverse();
    await AsyncStorage.setItem('quitPlanData', JSON.stringify({
      puffCount: count,
      targetDate: targetDate.toISOString(),
      startDate: startDate.toISOString(),         // ✅ save it properly
      puffLimitData: reversedPlan,      // ✅ save reversed plan
      quitDateStored: true,
    }));
    setStoredPuffLimitData(reversedPlan); // ✅ Immediately use the reversed plan


    setShowSecondModal(false);
    setQuitDateStored(true);
    setTimeLeft(Math.floor((targetDate.getTime() - startDate.getTime()) / 1000)); // use the same base
    setStartDate(startDate); // ✅ update the state too so it's ready for calculations
  };




  const chartWidth = Dimensions.get('window').width - scale(48);
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
    return generateAggressiveStartPlan(totalDays, puffCountNum);
  }, [puffCountNum, totalDays]);



  
  const puffLimitData = useMemo(() => {
    if (loading) return [];

    if (storedPuffLimitData.length > 0 && storedPuffLimitData.every(n => typeof n === 'number')) {
      return storedPuffLimitData; // use as-is, already reversed
    }
    console.warn('⚠️ Using fallback! puffLimitData was missing or corrupted.');
    return fallbackRandomizedSteps.slice().reverse(); // reverse fallback too
  }, [storedPuffLimitData, loading]);



  const todayIndex = useMemo(() => {
    if (!startDate) return 0;
    const now = new Date();

    const truncateToDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    const daysPassed = Math.floor(
      (truncateToDate(new Date()).getTime() - truncateToDate(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    
    return Math.min(daysPassed, puffLimitData.length - 1);
  }, [startDate, puffLimitData.length]);

  // --- PLAN OVER LOGIC ---
  const daysPassed = useMemo(() => {
    if (!startDate) return 0;
    const truncateToDate = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.floor(
      (truncateToDate(new Date()).getTime() - truncateToDate(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
  }, [startDate]);
  const planIsOver = daysPassed >= totalDays || todayIndex >= puffLimitData.length;
  const todayLimit = planIsOver ? null : puffLimitData[todayIndex] ?? null;


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

  const renderTimers = timeLeft !== null && !isNaN(timeLeft) && timeLeft > 0 && !loading;

  const graphDataReady =
  totalDays > 0 &&
  puffLimitData.length === totalDays &&
  puffEnteredData.length === totalDays &&
  puffLimitData.every(n => typeof n === 'number' && !isNaN(n)) &&
  puffEnteredData.every(n => typeof n === 'number' && !isNaN(n));

  // Generate labels for the chart based on totalDays
  let labels: string[] = [];
  if (totalDays <= 11) {
    // Show a label for every day
    labels = Array.from({ length: totalDays }, (_, i) => (totalDays - 1 - i).toString());
  } else if (totalDays === 12) {
    // Show 12,10,8,6,4,2,0
    const labelDays = [12, 10, 8, 6, 4, 2, 0];
    labels = Array.from({ length: totalDays }, (_, i) => {
      const dayLeft = totalDays - 1 - i;
      return labelDays.includes(dayLeft) ? dayLeft.toString() : '';
    });
  } else if (totalDays === 11) {
    // Show 11,9,7,5,3,1,0
    const labelDays = [11, 9, 7, 5, 3, 1, 0];
    labels = Array.from({ length: totalDays }, (_, i) => {
      const dayLeft = totalDays - 1 - i;
      return labelDays.includes(dayLeft) ? dayLeft.toString() : '';
    });
  } else {
    // For more than 12 days, show max 11 labels spaced as evenly as possible, always including 0 and totalDays-1
    const maxLabels = 11;
    const step = Math.ceil((totalDays - 1) / (maxLabels - 1));
    let labelDays = [];
    for (let d = totalDays - 1; d >= 0; d -= step) {
      labelDays.push(d);
    }
    if (labelDays[labelDays.length - 1] !== 0) labelDays.push(0);
    labelDays = Array.from(new Set(labelDays)).sort((a, b) => b - a);
    labels = Array.from({ length: totalDays }, (_, i) => {
      const dayLeft = totalDays - 1 - i;
      return labelDays.includes(dayLeft) ? dayLeft.toString() : '';
    });
  }


  useEffect(() => {
    if (!isFocused) return;

    if (todayLimit === null) {
      setPuffsTodayColor('#ffffff'); // default color if no limit
    } else if (puffsToday < todayLimit) {
      setPuffsTodayColor('#22c55e'); // green
    } else if (puffsToday > todayLimit) {
      setPuffsTodayColor('#ef4444'); // red
    } else {
      setPuffsTodayColor('#facc15'); // yellow
    }
  }, [isFocused, puffsToday, todayLimit]);


  useImperativeHandle(ref, () => ({
    resetData,
    triggerResetModal: () => setShowResetConfirmModal(true), // Use a dedicated modal for TopBar reset
  }));


  const hasFinishedRef = useRef(false);

  useEffect(() => {
    if (planPage === 2 && !quitDateStored && !hasFinishedRef.current) {
      hasFinishedRef.current = true;
      const timeout = setTimeout(() => {
        if (!quitDateStored) {
          handleFinish();
        }
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [planPage, quitDateStored, handleFinish]);


  // Update the red line (puffEnteredData) immediately when today's puff count changes or after reset
  useEffect(() => {
    if (!startDate || !targetDate) return;
    const updateTodayPuffHistory = async () => {
      const totalDays = Math.ceil((targetDate.getTime() - startDate.getTime()) / 86400000) + 1;
      const newData: number[] = [];
      const todayStr = new Date().toISOString().split('T')[0];
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        if (i === 0 && dateStr === todayStr) {
          // Always use today's puff count for the first day if today is the first day
          const json = await AsyncStorage.getItem(`puffTimes-${todayStr}`);
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
        } else {
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
      }
      setPuffHistoryData(newData);
    };
    updateTodayPuffHistory();
  }, [homePuffCount, startDate, targetDate]);


  if (!quitDateStored) {
  if (planPage === 0) {
    return (
      <ScrollView contentContainerStyle={styles.onboardingContainer}>
        <Text style={styles.modalTitle}>Set Your Quit Date</Text>
        <Text style={styles.modalText}>
          The best way to quit is to set a goal and reduce slowly over time.
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
            minimumDate={(() => {
              const min = new Date();
              min.setDate(min.getDate() + 6);
              return min;
            })()}
            maximumDate={(() => {
              const max = new Date();
              max.setDate(max.getDate() + 90);
              return max;
            })()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <Text style={styles.orText}>Quick Options</Text>
        <View style={styles.quickOptions}>
          {[7, 30, 60].map(days => (
            <TouchableOpacity key={days} style={styles.optionButton} onPress={() => addDays(days)}>
              <Text style={styles.optionButtonText}>{days} Days</Text>
            </TouchableOpacity>
          ))}
        </View>
          
        <LinearGradient
          colors={['#EF4444', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <TouchableOpacity style={styles.puffButton} onPress={() => setPlanPage(1)}>
            <Text style={styles.puffButtonText}>Next</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    );
  }

  if (planPage === 1) {
    return (
      <ScrollView contentContainerStyle={styles.onboardingContainer}>
        <Text style={styles.modalTitle}>Track Your Puffs</Text>
        <Text style={styles.modalText}>
          Enter your current daily puff count. We’ll use it to build a custom reduction plan.
        </Text>

        <Text style={styles.puffLabel}>How many puffs do you take daily?</Text>
        <TextInput
          style={styles.puffInput}
          value={puffCount}
          onChangeText={setPuffCount}
          keyboardType="numeric"
          placeholder="500"
          placeholderTextColor="#666666"
        />

        <Text style={styles.recommendText}>
          We recommend tracking your puffs for a day or two before entering here to get a better plan.
        </Text>

        <LinearGradient
          colors={['#EF4444', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <TouchableOpacity
            style={styles.puffButton}
            onPress={async () => {
              if (!puffCount || isNaN(Number(puffCount)) || Number(puffCount) <= 0) {
                alert('Please enter a valid number of puffs');
                return;
              }

              await handleFinish(); // ✅ generate and store the plan
              setQuitDateStored(true); // ✅ flip the flag so main UI loads
            }}

          >
            <Text style={styles.puffButtonText}>Next</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    );
  }

}


  return (
    <View style={styles.container}>
      <View style={styles.dualCard}>
        <View style={styles.dualValue}>
          <Text style={styles.cardNumber}>{todayLimit === null ? 'Not Set' : todayLimit}</Text>
          <Text style={styles.cardLabel}>Limit Today</Text>
        </View>
        <View style={styles.dualValue}>
          <Text style={[styles.cardNumber, { color: puffsTodayColor }]}>{puffsToday}</Text>
          <Text style={styles.cardLabel}>Puffs Today</Text>
        </View>
      </View>


      <View style={styles.timerContainer}>
        {!planIsOver ? (
          <>
            <Text style={styles.timerTitle}>You'll be Vape Free in</Text>
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
              <Text style={[styles.errorText, { color: '#fff' }]}>Set a future date to start the timer</Text>
            )}
          </>
        ) : (
          <Text style={[styles.errorText, { color: '#fff' }]}>Set a future date to start the timer</Text>
        )}
      </View>

      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Puff Reduction Plan</Text>
        {graphDataReady ? (
          <View
            style={{
              width: SCREEN_WIDTH * 0.9, // 🟢 same as StatsScreen
              borderRadius: 16,
              overflow: 'hidden',
              backgroundColor: '#000',
              paddingRight: scale(35),
            }}
          >
            <LineChart
              data={{
                labels: labels,
                datasets: [
                  {
                    data: puffLimitData, // use as-is
                    color: () => `#3B82F6`,
                    strokeWidth: 2,
                  },
                  {
                    data: puffEnteredData, // use as-is
                    color: () => '#EF4444',
                    strokeWidth: 2,
                  },
                ],
              }}
              width={SCREEN_WIDTH * 0.9}
              height={Math.max(
                verticalScale(160),
                Math.min(verticalScale(240), SCREEN_HEIGHT * 0.3)
              )}
              yAxisLabel=""
              withVerticalLabels={true}
              withDots={false}
              withInnerLines={false}
              withOuterLines={false}
              segments={5}
              bezier
              chartConfig={{
                backgroundColor: '#000',
                backgroundGradientFrom: '#000',
                backgroundGradientTo: '#000',
                decimalPlaces: 0,
                fillShadowGradient: 'transparent',
                fillShadowGradientOpacity: 0,
                color: () => `#ffffff`,
                labelColor: () => `#ffffff`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                marginVertical: 8,
                alignSelf: 'center',
              }}
            />
          </View>
        ) : (
          <Text style={styles.errorText}>Loading graph data...</Text>
        )}
      </View>

      {/* Reset confirmation modal for TopBar reset */}
      <Modal
        transparent={true}
        visible={showResetConfirmModal}
        animationType="fade"
        onRequestClose={() => setShowResetConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reset Quit Plan</Text>
            <Text style={styles.modalText}>This will delete your current plan and allow you to start over.</Text>
            <Pressable style={styles.saveButton} onPress={() => { setShowResetConfirmModal(false); resetData(); }}>
              <Text style={styles.saveButtonText}>Reset Plan</Text>
            </Pressable>
            <Pressable
              style={[styles.saveButton, { backgroundColor: '#333', marginTop: 10 }]}
              onPress={() => setShowResetConfirmModal(false)}
            >
              <Text style={[styles.saveButtonText, { color: '#fff' }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    paddingTop: verticalScale(20),
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(30),
  },
  onboardingContainer: {
    flexGrow: 1,
    backgroundColor: '#000000',
    padding: scale(24),
    justifyContent: 'flex-start', // tighter stacking
  },

  modalTitle: {
    fontSize: scale(22),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: verticalScale(6), // tighter
  },

  modalText: {
    fontSize: scale(14),
    color: '#aaaaaa',
    marginBottom: verticalScale(14), // tighter than 20+
  },

  modalSubText: {
    fontSize: scale(14),
    color: '#aaaaaa',
    marginBottom: verticalScale(20),
  },
  dateLabel: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: verticalScale(8),
  },
  dateInput: {
    backgroundColor: '#1a1a1a',
    padding: scale(12),
    borderRadius: scale(12),
    marginBottom: verticalScale(16),
    color: '#ffffff',
    fontSize: scale(16),
    width: '100%',
  },
  orText: {
    color: '#ffffff',
    fontSize: scale(14),
    textAlign: 'center',
    marginVertical: verticalScale(16),
  },
  quickOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(20),
    color: '#fff',
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: verticalScale(14),
    borderRadius: scale(12),
    alignItems: 'center',
    marginHorizontal: scale(5),
  },
  optionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: scale(14),
  },
  puffLabel: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: verticalScale(8),
  },
  puffInput: {
    backgroundColor: '#1a1a1a',
    padding: scale(12),
    borderRadius: scale(12),
    marginBottom: verticalScale(16),
    textAlign: 'center',
    color: '#ffffff',
    fontSize: scale(16),
    fontWeight: '500', // added this
    width: '100%',
  },
  recommendText: {
    fontSize: scale(13),
    color: '#aaaaaa',
    marginBottom: verticalScale(16),
  },
  gradientButton: {
    width: '100%',
    borderRadius: scale(30),
    marginTop: verticalScale(20),
  },
  puffButton: {
    paddingVertical: verticalScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scale(30),
    width: '100%',
  },
  puffButtonText: {
    color: '#000',
    fontSize: scale(16),
    fontWeight: 'bold',
  },
  // Existing retained styles for post-plan UI
  dualCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#020202',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(20),
    borderRadius: scale(10),
    width: '100%',
    marginBottom: verticalScale(20),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  dualValue: {
    flex: 1,
    alignItems: 'center',
  },
  timerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  timerTitle: {
    fontSize: scale(16),
    color: '#ffffff',
    opacity: 0.85,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: verticalScale(6),
  },
  timerCard: {
    alignItems: 'center',
    backgroundColor: '#020202',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(10),
    borderRadius: scale(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    width: '24%',
    marginBottom: verticalScale(12),
  },
  cardNumber: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardLabel: {
    fontSize: scale(12),
    color: '#ffffff',
    marginTop: verticalScale(5),
  },
  graphContainer: {
    width: '100%',
    marginVertical: verticalScale(20),
    alignItems: 'center',
    paddingHorizontal: scale(16),
  },
  graphTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    marginBottom: verticalScale(10),
    color: '#ffffff',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
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
  saveButton: {
    backgroundColor: '#fff',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(40),
    borderRadius: scale(30),
    marginTop: verticalScale(10),
    width: '100%',
  },
  saveButtonText: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },

});





export default GoalsScreen;
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, Pressable, Alert, StyleProp, ViewStyle, TextStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { usePuff } from '../context/PuffContext';
import { Animated } from 'react-native';
import { useIsFocused } from '@react-navigation/native';



// Define interfaces for data
interface ChartDataPoint {
  time: string;
  value: number;
}

interface PuffEntry {
  time: string;
  strength: number;
}

// Define interface for styles to match StyleSheet.create structure
interface AppStyles {
  container: StyleProp<ViewStyle>;
  titleContainer: StyleProp<ViewStyle>;
  counterContainer: StyleProp<ViewStyle>;
  counterCircle: StyleProp<ViewStyle>;
  counterText: StyleProp<TextStyle>;
  counterLabel: StyleProp<TextStyle>;
  nicotineText: StyleProp<TextStyle>;
  nicotineLabel: StyleProp<TextStyle>;
  puffButton: StyleProp<ViewStyle>;
  puffButtonText: StyleProp<TextStyle>;
  modalOverlay: StyleProp<ViewStyle>;
  modalContent: StyleProp<ViewStyle>;
  modalTitle: StyleProp<TextStyle>;
  inputRow: StyleProp<ViewStyle>;
  inputLabel: StyleProp<TextStyle>;
  input: StyleProp<TextStyle>;
  inputUnit: StyleProp<TextStyle>;
  saveButton: StyleProp<ViewStyle>;
  saveButtonText: StyleProp<TextStyle>;
  appTitle: StyleProp<TextStyle>;
  vapeText: StyleProp<TextStyle>;
  freeText: StyleProp<TextStyle>;
  nicotineCard: StyleProp<TextStyle>;
  cardLabel: StyleProp<TextStyle>;
  cardValue: StyleProp<TextStyle>;
  timerRow: StyleProp<TextStyle>;
  timerCard: StyleProp<TextStyle>;
  cardNumber: StyleProp<TextStyle>;
  cardLbl: StyleProp<TextStyle>;
}

const initialChartData: ChartDataPoint[] = [
  { time: '12 AM', value: 0 },
  { time: '6 AM', value: 0 },
  { time: '12 PM', value: 0 },
  { time: '6 PM', value: 0 },
  { time: '11 PM', value: 0 },
];


const formatTimeComponents = (seconds: number) => {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return { days, hours, minutes, seconds: secs };
};


const getRelativeTimeText = (lastPuff: Date | null): string => {
  if (!lastPuff) return 'No puffs yet';
  const now = new Date();
  const diff = Math.floor((now.getTime() - lastPuff.getTime()) / 1000); // in seconds

  if (diff < 60) return 'A few seconds ago';
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(diff / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};


const getDurationText = (seconds: number): string => {
  if (seconds < 60) return 'A few seconds';
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  const days = Math.floor(seconds / 86400);
  return `${days} day${days > 1 ? 's' : ''}`;
};




const HomeScreen = ({ refreshKey }: { refreshKey: number }) => {
  const { puffCount, setPuffCount } = usePuff();
  const [lifetimePuffs, setLifetimePuffs] = useState(0);
  const [nicotineStrength, setNicotineStrength] = useState('0');
  const isStrengthConfigured = parseFloat(nicotineStrength) > 0;
  const [nicotineMg, setNicotineMg] = useState(0);
  const [lifetimeNicotineMg, setLifetimeNicotineMg] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(initialChartData);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);
  const [puffTrigger, setPuffTrigger] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [todayLimit, setTodayLimit] = useState<number | null>(null);
  const [timeSinceLastPuff, setTimeSinceLastPuff] = useState(0); // in seconds
  const [lastPuffTime, setLastPuffTime] = useState<Date | null>(null);
  const [formattedTime, setFormattedTime] = useState(formatTimeComponents(0));
  const [relativeTimeText, setRelativeTimeText] = useState('—');
  const [longestTime, setLongestTime] = useState<number>(0);
  const [showStats, setShowStats] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1)); // starts fully visible
  const isFocused = useIsFocused();
  const showStatsRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);





  const formattedNicotine = `${nicotineMg.toFixed(2)} mg`;

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        const savedLifetimePuffs = await AsyncStorage.getItem('lifetimePuffs');
        const savedLifetimeNicotineMg = await AsyncStorage.getItem('lifetimeNicotineMg');
        const savedChartData = await AsyncStorage.getItem('chartData');
        const savedLastReset = await AsyncStorage.getItem('lastResetDate');
        const savedDailyLimit = await AsyncStorage.getItem('dailyLimit');
        const savedNicotineStrength = await AsyncStorage.getItem('nicotineStrength');

        if (savedNicotineStrength !== null) {
          console.log('Loaded nicotineStrength:', savedNicotineStrength);
          setNicotineStrength(savedNicotineStrength);
        } else {
          await AsyncStorage.setItem('nicotineStrength', '0');
          setNicotineStrength('0');
        }

        const today = new Date().toISOString().split('T')[0];
        

        if (savedLastReset !== today) {
          const today = new Date().toISOString().split('T')[0];
          const savedPuffTimes = await AsyncStorage.getItem(`puffTimes-${today}`);
          let puffTimes: Array<string | PuffEntry> = savedPuffTimes ? JSON.parse(savedPuffTimes) : [];
          const currentStrength = parseFloat(savedNicotineStrength || '0') || 0;

          const dailyPuffs = puffTimes.filter(item => {
            const puffDate = new Date(typeof item === 'string' ? item : item.time);
            return puffDate.toISOString().split('T')[0] === savedLastReset;
          }).length;

          const dailyNicotine = puffTimes.reduce((sum, item) => {
            if (typeof item === 'string') {
              return sum + currentStrength;
            } else {
              return sum + item.strength;
            }
          }, 0);

          const newLifetimePuffs = (savedLifetimePuffs ? parseInt(savedLifetimePuffs, 10) : 0) + dailyPuffs;
          const newLifetimeNicotineMg = (savedLifetimeNicotineMg ? parseFloat(savedLifetimeNicotineMg) : 0) + dailyNicotine;

          setLifetimePuffs(newLifetimePuffs);
          setLifetimeNicotineMg(newLifetimeNicotineMg);
          setPuffCount(0);
          setNicotineMg(0);
          setChartData(initialChartData);
          setLastResetDate(today);

          
          await AsyncStorage.setItem(`puffTimes-${today}`, JSON.stringify(puffTimes));
          await AsyncStorage.setItem('lifetimePuffs', newLifetimePuffs.toString());
          await AsyncStorage.setItem('lifetimeNicotineMg', newLifetimeNicotineMg.toString());
          await AsyncStorage.setItem('chartData', JSON.stringify(initialChartData));
          await AsyncStorage.setItem('lastResetDate', today);
        } else {
          setLifetimePuffs(savedLifetimePuffs ? parseInt(savedLifetimePuffs, 10) : 0);
          setLifetimeNicotineMg(savedLifetimeNicotineMg ? parseFloat(savedLifetimeNicotineMg) : 0);
          setChartData(savedChartData ? JSON.parse(savedChartData) : initialChartData);
          const savedNicotineMg = await AsyncStorage.getItem(`nicotineMg-${today}`);
          setNicotineMg(savedNicotineMg ? parseFloat(savedNicotineMg) : 0);

          setLastResetDate(savedLastReset);
        }

        setIsInitialized(true); // ✅ signal ready
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeInSeconds = getTimeSinceLastPuff();
      setFormattedTime(formatTimeComponents(timeInSeconds));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastPuffTime]);


  useEffect(() => {
    const computeNicotineMg = async () => {
      const today = new Date().toISOString().split('T')[0];
      const savedPuffTimes = await AsyncStorage.getItem(`puffTimes-${today}`);
      const puffTimes = savedPuffTimes ? JSON.parse(savedPuffTimes) : [];

      const parsedStrength = parseFloat(nicotineStrength) || 0;

      const todayPuffs = puffTimes.filter((entry: string | PuffEntry) => {
        const time = typeof entry === 'string' ? entry : entry.time;
        return new Date(time).toISOString().split('T')[0] === today;
      });

      const totalMg = todayPuffs.reduce((sum: number, entry: string | PuffEntry) => {
        const puffStrength = typeof entry === 'string' ? parsedStrength : entry.strength;
        return sum + puffStrength;
      }, 0);

      console.log('Computed nicotineMg for today:', totalMg, 'using strength:', parsedStrength);
      //setNicotineMg(totalMg);
    };

    if (isInitialized) {
      computeNicotineMg();
    }
  }, [nicotineStrength, puffTrigger, isInitialized]);

  const [quitDate, setQuitDate] = useState<string>('Not set');


useEffect(() => {
  const loadQuitPlanInfo = async () => {
    const plan = await AsyncStorage.getItem('quitPlanData');
    if (!plan) {
      setTodayLimit(null);
      setQuitDate('Not set');
      return;
    }

    try {
      const parsed = JSON.parse(plan);
      const { puffLimitData, startDate, targetDate, quitDateStored } = parsed;

      if (targetDate) {
        const formatted = new Date(targetDate).toLocaleDateString();
        setQuitDate(formatted);
      } else {
        setQuitDate('Not set');
      }

      if (quitDateStored && Array.isArray(puffLimitData) && startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const daysPassed = Math.floor(
          (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
           new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()) /
          (1000 * 60 * 60 * 24)
        );

        const limit = puffLimitData[daysPassed] ?? null;
        setTodayLimit(typeof limit === 'number' ? limit : null);
      } else {
        setTodayLimit(null);
      }

    } catch (err) {
      console.error('Error loading plan info:', err);
      setTodayLimit(null);
      setQuitDate('Not set');
    }
  };

  loadQuitPlanInfo();
}, [refreshKey]); // 🔁 Triggers when tab index changes





  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTimeText(getRelativeTimeText(lastPuffTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [lastPuffTime]);




  const handlePuff = async () => {
    const strength = parseFloat(nicotineStrength) || 0;
    const nicotinePerPuff = 0.005 * strength;
    const now = new Date();

    // 🔄 Update timer & nicotine display immediately
    setLastPuffTime(now);
    const newNicotineMg = nicotineMg + nicotinePerPuff;
    setNicotineMg(newNicotineMg);
    setPuffCount(prev => prev + 1);
    setPuffTrigger(prev => prev + 1);

    const secondsSinceLastPuff = lastPuffTime ? Math.floor((now.getTime() - lastPuffTime.getTime()) / 1000) : 0;

    if (secondsSinceLastPuff > longestTime) {
      setLongestTime(secondsSinceLastPuff);
      await AsyncStorage.setItem('longestTime', secondsSinceLastPuff.toString());
    }


    const puffTime = now.toISOString();
    const puffEntry: PuffEntry = { time: puffTime, strength };
    const today = new Date().toISOString().split('T')[0];

    try {
      const savedDaily = await AsyncStorage.getItem(`puffTimes-${today}`);
      const dailyPuffTimes = savedDaily ? JSON.parse(savedDaily) : [];

      dailyPuffTimes.push(puffEntry);

      await AsyncStorage.setItem(`puffTimes-${today}`, JSON.stringify(dailyPuffTimes));
      await AsyncStorage.setItem('lastPuffTimestamp', puffTime);
      await AsyncStorage.setItem(`nicotineMg-${today}`, newNicotineMg.toString());

      setShowStats(true);
      fadeAnim.setValue(1);
    } catch (error) {
      console.error('Error saving puff data:', error);
    }
  };



  const handleCirclePress = () => {
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    const strength = parseFloat(nicotineStrength);

    if (nicotineStrength && (isNaN(strength) || strength < 0)) {
      Alert.alert('Invalid input', 'Please enter a valid nicotine strength.');
      return;
    }

    try {
      // ✅ Save explicitly, not via useEffect
      await AsyncStorage.setItem('nicotineStrength', nicotineStrength);

      console.log('Saved nicotineStrength to storage:', nicotineStrength);

      setIsModalVisible(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  const handlePuffCountUpdate = (count: number) => {
    setPuffCount(count);
  };



  useEffect(() => {
    const loadTodayPuffCount = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        const savedPuffTimes = await AsyncStorage.getItem(`puffTimes-${today}`);
        const puffTimes = savedPuffTimes ? JSON.parse(savedPuffTimes) : [];
        setPuffCount(puffTimes.length);
      } catch (err) {
        console.error('Failed to load today\'s puff count:', err);
        setPuffCount(0);
      }
    };

    if (isInitialized) {
      loadTodayPuffCount();
    }
  }, [isInitialized, puffTrigger]);

  useEffect(() => {
    const restoreLastPuff = async () => {
      const lastPuffStr = await AsyncStorage.getItem('lastPuffTimestamp');
      const longestStr = await AsyncStorage.getItem('longestTime');

      if (lastPuffStr) {
        setLastPuffTime(new Date(lastPuffStr));
      }
      if (longestStr) {
        setLongestTime(parseInt(longestStr, 10) || 0);
      }
    };

    if (isInitialized) {
      restoreLastPuff();
    }
  }, [isInitialized]);



  useEffect(() => {
    if (isModalVisible || isStrengthConfigured) {
      console.log('[ANIMATION] Skipped due to modal open or strength configured.');
      return;
    }

    console.log('[ANIMATION] Starting animation cycle');

    const cycle = () => {
      console.log('[ANIMATION] Fading out...', showStatsRef.current ? 'Showing stats' : 'Showing text');

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        showStatsRef.current = !showStatsRef.current;
        setShowStats(showStatsRef.current);

        console.log('[ANIMATION] Switched to:', showStatsRef.current ? 'Stats view' : '"Tap to Configure"');

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          const nextDelay = showStatsRef.current ? 7000 : 3000;
          console.log(`[ANIMATION] Will show this view for ${nextDelay / 1000} seconds`);
          timeoutRef.current = setTimeout(cycle, nextDelay);
        });
      });
    };

    timeoutRef.current = setTimeout(() => {
      console.log('[ANIMATION] Initial delay complete, running cycle...');
      cycle();
    }, showStatsRef.current ? 7000 : 3000);

    return () => {
      console.log('[ANIMATION] Cleaning up timeout');
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isModalVisible, isStrengthConfigured]);










  const getTimeSinceLastPuff = (): number => {
    if (!lastPuffTime) return 0;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - lastPuffTime.getTime()) / 1000);
    return seconds >= 0 ? seconds : 0;
  };

  const currentElapsed = getTimeSinceLastPuff();

  useEffect(() => {
    if (currentElapsed > longestTime) {
      setLongestTime(currentElapsed);
    }
  }, [currentElapsed]);






  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.appTitle}>
          <Text style={styles.freeText}>Puff</Text>
          <Text style={styles.vapeText}>Daddy</Text>
        </Text>
      </View>
      <TouchableOpacity onPress={handleCirclePress} style={styles.counterContainer}>
        <View style={styles.counterCircle}>
          {isStrengthConfigured ? (
            // If configured, show data without animation
            <>
              <Text style={styles.counterText}>{puffCount}</Text>
              <Text style={styles.counterLabel}>PUFFS TODAY</Text>
              <Text style={[styles.nicotineText, { fontWeight: 'bold', color: '#E50000' }]}>
                {formattedNicotine}
              </Text>
              <Text style={[styles.nicotineLabel]}>Nicotine</Text>
            </>
          ) : (
            <>
              <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: fadeAnim,
              }}
            >
              {showStats ? (
                <>
                  <Text style={styles.counterText}>{puffCount}</Text>
                  <Text style={styles.counterLabel}>PUFFS TODAY</Text>
                  <Text
                    style={[
                      styles.nicotineText,
                      { fontWeight: 'bold', color: '#E50000' },
                    ]}
                  >
                    {formattedNicotine}
                  </Text>
                  <Text style={styles.nicotineLabel}>Nicotine</Text>
                </>
              ) : (
                <Text
                  style={[styles.counterLabel, { fontSize: 16, textAlign: 'center' }]}
                >
                  Tap to Configure
                </Text>
              )}
            </Animated.View>

            </>
          )}
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, width: '100%' }}>
        <View style={styles.timerCard}>
          <Text style={styles.cardLbl}>Puff Limit</Text>
          <Text style={styles.cardNumber}>{todayLimit ?? 'Not Set'}</Text>
        </View>
        <View style={styles.timerCard}>
          <Text style={styles.cardLbl}>Quit Date</Text>
          <Text style={styles.cardNumber}>{quitDate}</Text>
        </View>
        <View style={styles.timerCard}>
          <Text style={styles.cardLbl}>Last Puff</Text>
          <Text style={styles.cardNumber}>{relativeTimeText}</Text>
        </View>
        <View style={styles.timerCard}>
          <Text style={styles.cardLbl}>Record Time</Text>
          <Text style={styles.cardNumber}>{getDurationText(Math.max(longestTime, currentElapsed))}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.puffButton} onPress={handlePuff}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.puffButtonText}>PUFF</Text>
      </TouchableOpacity>




      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Strength</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={nicotineStrength}
                onChangeText={setNicotineStrength}
                placeholder="e.g., 3"
              />
              <Text style={styles.inputUnit}>mg/ml</Text>
            </View>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles: AppStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    marginBottom: 20,
  },
  counterContainer: {
    paddingTop: 40,
    alignItems: 'center',
  },
  counterCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#212124',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  counterText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  counterLabel: {
    fontSize: 16,
    color: '#ffffff',
  },
  nicotineText: {
    fontSize: 18,
    color: `rgba(229, 0, 0, 1)`,
    marginTop: 12,
  },
  nicotineLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
  puffButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e50000',
    paddingVertical: 20,
    paddingHorizontal: 50,
    marginTop: 30,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  puffButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  inputLabel: {
    fontSize: 16,
    marginRight: 10,
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 5,
    padding: 5,
    flex: 1,
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: 16,
    marginLeft: 5,
  },
  saveButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  nicotineCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    width: '90%',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E50000',
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    width: '100%',
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
    width: '48%',
    marginBottom: 12,
  },
  cardNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardLbl: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 5,
  },

});

export default HomeScreen;
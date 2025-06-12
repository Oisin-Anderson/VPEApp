import React, { useState, useEffect, Fragment } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, TextInput, Pressable, Alert } from 'react-native';
import { Svg, Path, Line, Circle, Rect, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { usePuff } from '../context/PuffContext';// Adjust the path

interface ChartDataPoint {
  time: string;
  value: number;
}

interface PuffEntry {
  time: string;
  strength: number;
}

const initialChartData: ChartDataPoint[] = [
  { time: '12 AM', value: 0 },
  { time: '6 AM', value: 0 },
  { time: '12 PM', value: 0 },
  { time: '6 PM', value: 0 },
  { time: '11 PM', value: 0 },
];

const HomeScreen = () => {
  const { puffCount, setPuffCount } = usePuff();
  const [lifetimePuffs, setLifetimePuffs] = useState(0);
  const [nicotineStrength, setNicotineStrength] = useState('0');
  const [nicotineMg, setNicotineMg] = useState(0);
  const [lifetimeNicotineMg, setLifetimeNicotineMg] = useState(0);
  const [dailyLimit, setDailyLimit] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(initialChartData);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);
  const [puffTrigger, setPuffTrigger] = useState(0);

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

        console.log('Loaded nicotineStrength:', savedNicotineStrength);

        if (savedDailyLimit) setDailyLimit(savedDailyLimit);
        if (savedNicotineStrength) {
          setNicotineStrength(savedNicotineStrength);
        } else {
          setNicotineStrength('0');
        }

        const today = new Date().toISOString().split('T')[0];

        if (savedLastReset !== today) {
          const savedPuffTimes = await AsyncStorage.getItem('puffTimes');
          let puffTimes: Array<string | PuffEntry> = savedPuffTimes ? JSON.parse(savedPuffTimes) : [];
          const currentStrength = parseFloat(savedNicotineStrength || nicotineStrength) || 0;

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

          await AsyncStorage.setItem('puffTimes', JSON.stringify([]));
          await AsyncStorage.setItem('lifetimePuffs', newLifetimePuffs.toString());
          await AsyncStorage.setItem('lifetimeNicotineMg', newLifetimeNicotineMg.toString());
          await AsyncStorage.setItem('chartData', JSON.stringify(initialChartData));
          await AsyncStorage.setItem('lastResetDate', today);
        } else {
          setLifetimePuffs(savedLifetimePuffs ? parseInt(savedLifetimePuffs, 10) : 0);
          setLifetimeNicotineMg(savedLifetimeNicotineMg ? parseFloat(savedLifetimeNicotineMg) : 0);
          setChartData(savedChartData ? JSON.parse(savedChartData) : initialChartData);
          setLastResetDate(savedLastReset);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('nicotineStrength', nicotineStrength);
        await AsyncStorage.setItem('dailyLimit', dailyLimit);
      } catch (error) {
        console.log('Error saving data:', error);
      }
    };
    saveData();
  }, [nicotineStrength, dailyLimit]);

  const handlePuff = async () => {
    const limit = parseInt(dailyLimit, 10);
    if (!isNaN(limit) && puffCount >= limit) {
      Alert.alert('Limit reached', `You have reached your daily limit of ${limit} puffs.`);
      return;
    }

    const strength = parseFloat(nicotineStrength) || 0;
    const now = new Date();
    const puffTime = now.toISOString();
    const puffEntry: PuffEntry = { time: puffTime, strength };

    try {
      const savedPuffTimes = await AsyncStorage.getItem('puffTimes');
      const puffTimes = savedPuffTimes ? JSON.parse(savedPuffTimes) : [];
      puffTimes.push(puffEntry);

      await AsyncStorage.setItem('puffTimes', JSON.stringify(puffTimes));

      setNicotineMg((prev: number) => prev + strength);
      setPuffCount((prev: number) => prev + 1); // Explicitly typed as number via context

      setPuffTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error adding puff:', error);
    }
  };

  const handleCirclePress = () => {
    setIsModalVisible(true);
  };

  const handleSave = () => {
    if (dailyLimit && (isNaN(parseInt(dailyLimit)) || parseInt(dailyLimit) <= 0)) {
      Alert.alert('Invalid input', 'Please enter a valid daily puff limit.');
      return;
    }
    if (nicotineStrength && (isNaN(parseFloat(nicotineStrength)) || parseFloat(nicotineStrength) < 0)) {
      Alert.alert('Invalid input', 'Please enter a valid nicotine strength.');
      return;
    }
    setIsModalVisible(false);
    console.log('Modal saved, nicotineStrength:', nicotineStrength);
  };

  const handlePuffCountUpdate = (count: number) => {
    setPuffCount(count); // Explicitly typed as number via context
  };

  function getSmoothPath(points: { x: number; y: number }[]) {
    if (points.length < 2) return `M${points[0].x},${points[0].y}`;

    let d = `M${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? i : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      const goingUp = p2.y < p1.y;

      if (goingUp) {
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C${cp1x},${cp1y},${cp2x},${cp2y},${p2.x},${p2.y}`;
      } else {
        d += ` L${p2.x},${p2.y}`;
      }
    }

    return d;
  }

  function getShadowPath(points: { x: number; y: number }[], chartHeight: number, padding: number) {
    if (points.length < 2) return '';

    const linePath = getSmoothPath(points);
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];

    return `${linePath} L${lastPoint.x},${chartHeight - padding} L${firstPoint.x},${chartHeight - padding} L${firstPoint.x},${firstPoint.y} Z`;
  }

  const SimpleChart = ({ puffTrigger, onPuffCountUpdate }: { puffTrigger: number; onPuffCountUpdate: (count: number) => void }) => {
  const width = Dimensions.get('window').width - 20;
  const height = 150;
  const basePadding = 10;
  const maxLabelWidth = 30;

  const [points, setPoints] = useState<{ x: number; y: number; time: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const convertToHours = (time: string) => {
    const [hourStr, period] = time.split(' ');
    const hour = parseInt(hourStr.split(':')[0], 10);
    return period === 'AM' && hour === 12 ? 0 : period === 'PM' && hour !== 12 ? hour + 12 : hour;
  };

  const formatCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12} ${period}`;
  };

  const now = new Date();
  const currentHour = now.getHours();
  const allTimes = ['12 AM', '6 AM', '12 PM', '6 PM', '11 PM'];
  const passedTimes = allTimes.filter(time => convertToHours(time) <= currentHour);
  const fixedTimes = passedTimes.includes('12 PM') && currentHour === 12 ? [...passedTimes] : [...passedTimes, formatCurrentTime()];

  useEffect(() => {
    const loadPoints = async () => {
      setIsLoading(true);
      try {
        const puffTimesData = await AsyncStorage.getItem('puffTimes');
        let puffEntries: Array<string | PuffEntry> = puffTimesData ? JSON.parse(puffTimesData) : [];

        const today = new Date().toISOString().split('T')[0];
        const todayPuffEntries = puffEntries.filter(item => {
          const puffDate = new Date(typeof item === 'string' ? item : item.time);
          return puffDate.toISOString().split('T')[0] === today;
        });

        onPuffCountUpdate(todayPuffEntries.length);

        const hoursForPoints = fixedTimes.map(time => (time === 'Current' ? currentHour : convertToHours(time)));
        const cumulativeCounts = hoursForPoints.map(hour =>
          todayPuffEntries.filter(item => {
            const puffDate = new Date(typeof item === 'string' ? item : item.time);
            return puffDate.getHours() <= hour;
          }).length
        );

        const maxValue = Math.max(...cumulativeCounts, 1);
        const padding = basePadding + maxLabelWidth;

        const computedPoints = fixedTimes.map((time, index) => {
          const value = cumulativeCounts[index];
          const x = padding + (index * ((width - 2 * padding) / (fixedTimes.length - 1)));
          const y = height - padding - ((value / maxValue) * (height - 2 * padding));
          return { x, y, time, value };
        });

        setPoints(computedPoints);
      } catch (error) {
        console.error('Error loading points:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPoints();
  }, [puffTrigger, onPuffCountUpdate]);

  if (isLoading || points.length === 0) {
    return null;
  }

  const maxValue = Math.max(...points.map(p => p.value), 1);
  const padding = basePadding + maxLabelWidth;

  const linePath = getSmoothPath(points);
  const shadowPath = getShadowPath(points, height, padding);

  return (
    <View style={[styles.chartContainer, { paddingHorizontal: padding }]}>
      <Svg height={height} width={width}>
        <Rect x="0" y="0" width={width} height={height} fill="#1c1c1c" rx="10" />
        {[height / 2, height - padding].map((y, i) => (
          <Line
            key={`hline-${i}`}
            x1={padding}
            y1={y}
            x2={width - padding}
            y2={y}
            stroke="#404040"
            strokeWidth="0.5"
            strokeDasharray="4"
          />
        ))}
        <Path d={shadowPath} fill="rgba(255, 0, 0, 0.3)" stroke="none" />
        <Path d={linePath} fill="none" stroke="#FF3333" strokeWidth="2" />
        {points.map((point, i) => (
          <Fragment key={`${point.time}-${i}`}>
            <Circle cx={point.x} cy={point.y} r="3" fill="#FF3333" />
            {point.value > 0 && (
              <SvgText
                x={point.x}
                y={point.y - 10}
                fill="#fff"
                fontSize="10"
                textAnchor="middle"
              >
                {String(point.value)} {/* Ensure text is a string */}
              </SvgText>
            )}
          </Fragment>
        ))}
        {[0, maxValue / 2, maxValue].map((val, i) => {
          const y = height - padding - (val / maxValue) * (height - 2 * padding);
          return (
            <Fragment key={`axis-${i}`}>
              <Line x1={0} y1={y} x2={width} y2={y} stroke="#404040" strokeWidth="1" strokeDasharray="5,5" />
              <SvgText
                x={padding - 5}
                y={y}
                fill="#fff"
                fontSize="12"
                textAnchor="end"
                dy={3}
              >
                {String(Math.round(val))} {/* Ensure text is a string */}
              </SvgText>
            </Fragment>
          );
        })}
      </Svg>
      <View style={styles.chartLabels}>
        {points.map((p, i) => (
          <Text
            key={`label-${i}`}
            style={[styles.chartLabel, { left: p.x - padding - 25, position: 'absolute' }]}
          >
            {p.time} {/* Already wrapped in <Text> */}
          </Text>
        ))}
      </View>
    </View>
  );
};

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.appTitle}>
          <Text style={styles.vapeText}>Vape</Text>
          <Text style={styles.freeText}>Free</Text>
        </Text>
      </View>
      <TouchableOpacity onPress={handleCirclePress} style={styles.counterContainer}>
        <View style={styles.counterCircle}>
          <Text style={styles.counterText}>{puffCount}</Text>
          <Text style={styles.counterLabel}>PUFFS TODAY</Text>
          <Text style={styles.nicotineText}>{formattedNicotine}</Text>
          <Text style={styles.nicotineLabel}>NICOTINE</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Usage today</Text>
        <SimpleChart puffTrigger={puffTrigger} onPuffCountUpdate={handlePuffCountUpdate} />
      </View>
      <TouchableOpacity style={styles.puffButton} onPress={handlePuff}>
        <Ionicons name="add" size={24} color="#FFF" />
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
            <Text style={styles.modalTitle}>SETTINGS</Text>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Set Daily Puff Limit</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={dailyLimit}
                onChangeText={setDailyLimit}
                placeholder="e.g., 10"
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Set Strength</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={nicotineStrength}
                onChangeText={setNicotineStrength}
                placeholder="e.g., 0.5"
              />
              <Text style={styles.inputUnit}>mg</Text>
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

const styles = StyleSheet.create({
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
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  counterText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
  },
  counterLabel: {
    fontSize: 20,
    color: '#888',
  },
  nicotineText: {
    fontSize: 24,
    color: '#FF3333',
    marginTop: 10,
  },
  nicotineLabel: {
    fontSize: 16,
    color: '#888',
  },
  chartSection: {
    width: '90%',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
  },
  chartContainer: {
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 20,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    width: '100%',
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    transform: [{ translateX: '-50%' }],
  },
  puffButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3333',
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
  decorationLine: {
    height: 1,
    width: '80%',
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
  },
});

export default HomeScreen;
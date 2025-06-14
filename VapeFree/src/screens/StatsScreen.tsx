import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePuff } from '../context/PuffContext';

interface PuffEntry {
  time: string;
  strength: number;
}

const StatsScreen = () => {
  const { puffCount, setPuffCount } = usePuff();
  const [viewPeriod, setViewPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [puffHistory, setPuffHistory] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const screenWidth = Dimensions.get('window').width - 40;
  const [totalPuffsRecorded, setTotalPuffsRecorded] = useState(0);


  // Use a stable date reference, updated only on mount or when needed
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadPuffHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      let puffEntries: PuffEntry[] = [];
      const datesToCheck = [];

      if (viewPeriod === 'day') {
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1);
        datesToCheck.push(yesterday.toISOString().split('T')[0]);
      } else if (viewPeriod === 'week') {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(currentDate);
          d.setDate(currentDate.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          datesToCheck.push(dateStr);
        }
      } else if (viewPeriod === 'month') {
        for (let i = 29; i >= 0; i--) {
          const d = new Date(currentDate);
          d.setDate(currentDate.getDate() - i);
          datesToCheck.push(d.toISOString().split('T')[0]);
        }
      }

      // Load entries for all target dates
      for (const date of datesToCheck) {
        const key = `puffTimes-${date}`;
        const json = await AsyncStorage.getItem(key);
        if (json) {
          try {
            const dayEntries: PuffEntry[] = JSON.parse(json);
            puffEntries = [...puffEntries, ...dayEntries];
          } catch (e) {
            console.warn(`Error parsing ${key}`, e);
          }
        }
      }


      let history: number[];

      if (viewPeriod === 'day') {
        history = Array(24).fill(0);
        const yesterday = new Date(currentDate);
        yesterday.setDate(currentDate.getDate() - 1); // Wednesday, June 11, 2025
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        puffEntries.forEach(entry => {
          const date = new Date(entry.time);
          if (date.toISOString().split('T')[0] === yesterdayStr) {
            history[date.getHours()] += 1;
          }
        });
      } else if (viewPeriod === 'week') {
        history = Array(7).fill(0);
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 6); // Friday, June 6, 2025 (7 days ago from June 12)
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          history[i] = puffEntries.filter(e => {
            const entryDate = new Date(e.time);
            return entryDate.toISOString().split('T')[0] === dateStr;
          }).length;
        }
      } else if (viewPeriod === 'month') {
        history = Array(30).fill(0); // 30 days ending on currentDate
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 29); // 30 days ago from currentDate
        for (let i = 0; i < 30; i++) {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          history[i] = puffEntries.filter(e => {
            const entryDate = new Date(e.time);
            return entryDate.toISOString().split('T')[0] === dateStr;
          }).length;
        }
      } else {
        history = [];
      }
      setPuffHistory(history);
    } catch (error) {
      console.error('Failed to load puff history:', error);
      setPuffHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [viewPeriod, currentDate]); // Only re-run when viewPeriod or currentDate changes

  useEffect(() => {
    loadPuffHistory();
  }, [loadPuffHistory]);

  useEffect(() => {
    const calculateTotalPuffs = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const puffKeys = keys.filter(key => key.startsWith('puffTimes-'));

        let total = 0;

        for (const key of puffKeys) {
          const json = await AsyncStorage.getItem(key);
          if (json) {
            try {
              const entries = JSON.parse(json);
              total += Array.isArray(entries) ? entries.length : 0;
            } catch {
              // Ignore parse errors
            }
          }
        }

        setTotalPuffsRecorded(total);
      } catch (error) {
        console.error('Error calculating total puffs:', error);
      }
    };

    calculateTotalPuffs();
  }, []);


  useEffect(() => {
    const syncPuffHistory = async () => {
    const todayStr = currentDate.toISOString().split('T')[0];
    const savedTodayPuffTimes = await AsyncStorage.getItem(`puffTimes-${todayStr}`);
    const puffEntries: PuffEntry[] = savedTodayPuffTimes ? JSON.parse(savedTodayPuffTimes) : [];

    const totalPuffs = puffEntries.length;

    // ✅ Only sync puffCount, do NOT overwrite graph data
    if (totalPuffs !== puffCount) {
      setPuffCount(totalPuffs);
    }
  };


    if (puffCount > 0) {
      syncPuffHistory();
    }
  }, [puffCount, viewPeriod, setPuffCount, currentDate]);

  const labels = useMemo(() => {
  if (viewPeriod === 'day') {
    return [0, 4, 8, 12, 16, 20].map(i => i.toString());
  }
  if (viewPeriod === 'week') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentDate);
      d.setDate(currentDate.getDate() - i);
      labels.push(dayNames[d.getDay()]);
    }

    return labels;
  }
  // Adjust month labels to start from today and work backwards in 5-day decrements
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - 29); // Start 30 days ago (May 14, 2025 for June 12)
  const labels = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - (i * 5)); // Work backwards 5 days at a time
    const day = date.getDate();
    if (date >= startDate) { // Ensure within 30-day range
      labels.unshift(day.toString()); // Add to start of array
    }
  }
  // Ensure we have 7 labels, filling backwards if needed
  while (labels.length < 7 && parseInt(labels[0]) > startDate.getDate()) {
    const date = new Date(currentDate);
    date.setDate(parseInt(labels[0]) - 5);
    labels.unshift(date.getDate().toString());
  }
  return labels;
}, [viewPeriod, currentDate]);

  const handlePeriodChange = (period: 'day' | 'week' | 'month') => {
    setViewPeriod(period);
  };

  // Update currentDate daily (e.g., at midnight)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now);
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [currentDate]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
          Total Puffs Logged: {totalPuffsRecorded}
        </Text>
      </View>
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: labels,
            datasets: [{
              data: puffHistory,
              withDots: viewPeriod === 'week'|| viewPeriod === 'day'|| viewPeriod === 'month' ? false : true, // Remove bullets only for week graph
            }],
          }}
          width={screenWidth - 20} // Reduce width slightly to accommodate the shift
          height={220}
          bezier
          yAxisLabel=""
          withHorizontalLines={viewPeriod === 'week'|| viewPeriod === 'day'|| viewPeriod === 'month' ? false : true} // Remove horizontal lines for week
          withVerticalLines={viewPeriod === 'week'|| viewPeriod === 'day'|| viewPeriod === 'month' ? false : true} // Remove vertical lines for week
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 0, 0, 1)`, // Solid red color with fixed opacity of 1
            style: { borderRadius: 16 },
          }}
          style={{ ...styles.chart, marginLeft: 10 }} // Merge styles into a single object
        />
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => handlePeriodChange('day')} style={[styles.periodButton, viewPeriod === 'day' && styles.activeButton]}>
          <Text>Day</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePeriodChange('week')} style={[styles.periodButton, viewPeriod === 'week' && styles.activeButton]}>
          <Text>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePeriodChange('month')} style={[styles.periodButton, viewPeriod === 'month' && styles.activeButton]}>
          <Text>Month</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 120, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  periodButton: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  activeButton: { backgroundColor: '#007AFF', color: '#fff' },
  chartContainer: { alignItems: 'center' },
  chart: { marginVertical: 8, borderRadius: 16 },
});

export default StatsScreen;
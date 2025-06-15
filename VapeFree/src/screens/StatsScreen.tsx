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
  const periodPuffCount = useMemo(() => {
    return puffHistory.reduce((sum, val) => sum + val, 0);
  }, [puffHistory]);
  const screenWidth = Dimensions.get('window').width - 40;
  const [totalPuffsRecorded, setTotalPuffsRecorded] = useState(0);
  const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date); // e.g., "Jun 14, 2025"

  const isYesterday = (date: Date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    );
  };




  // Use a stable date reference, updated only on mount or when needed
  const [currentDate, setCurrentDate] = useState(new Date());

  const [viewStartDate, setViewStartDate] = useState<Date>(() => {
    const today = new Date();
    today.setDate(today.getDate() - 1);
    if (isNaN(today.getTime())) {
      console.warn('Invalid date fallback triggered');
      return new Date('2024-01-01');
    }
    return today;
  });


  const [firstLoginDate, setFirstLoginDate] = useState<Date>(() => {
    // Replace this with your actual value from AsyncStorage if needed
    return new Date('2024-01-01'); // first login fallback
  });


  const loadPuffHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      let puffEntries: PuffEntry[] = [];
      const datesToCheck = [];

      if (viewPeriod === 'day') {
        const yesterday = new Date(viewStartDate);
        yesterday.setDate(viewStartDate.getDate() - 1);
        datesToCheck.push(yesterday.toISOString().split('T')[0]);
      } else if (viewPeriod === 'week') {
        for (let i = 6; i >= 0; i--) {
          const d = new Date(viewStartDate);
          d.setDate(viewStartDate.getDate() - 6 + i); // includes today if viewStartDate is today
          const dateStr = d.toISOString().split('T')[0];
          datesToCheck.push(dateStr);
        }
      } else if (viewPeriod === 'month') {
        for (let i = 29; i >= 0; i--) {
          const d = new Date(viewStartDate);
          d.setDate(viewStartDate.getDate() - 29 + i);
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
        const yesterday = new Date(viewStartDate);
        yesterday.setDate(viewStartDate.getDate() - 1); // Wednesday, June 11, 2025
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        puffEntries.forEach(entry => {
          const date = new Date(entry.time);
          if (date.toISOString().split('T')[0] === yesterdayStr) {
            history[date.getHours()] += 1;
          }
        });
      } else if (viewPeriod === 'week') {
        history = Array(7).fill(0);
        const startDate = new Date(viewStartDate);
        startDate.setDate(viewStartDate.getDate() - 6); // Friday, June 6, 2025 (7 days ago from June 12)
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
        const startDate = new Date(viewStartDate);
        startDate.setDate(viewStartDate.getDate() - 29); // 30 days ago from currentDate
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
  }, [viewPeriod, viewStartDate]); // Only re-run when viewPeriod or currentDate changes

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
    const todayStr = viewStartDate.toISOString().split('T')[0];
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
  }, [puffCount, viewPeriod, setPuffCount, viewStartDate]);

  const labels = useMemo(() => {
    if (viewPeriod === 'day') {
      // 24-hour chart: label every 4 hours (0, 4, 8, ..., 20), empty in between
      return Array.from({ length: 24 }, (_, i) => (i % 4 === 0 ? i.toString() : ''));
    }

    if (viewPeriod === 'week') {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(viewStartDate);
        d.setDate(viewStartDate.getDate() - 6 + i); // start 6 days ago
        return dayNames[d.getDay()];
      });
    }


    if (viewPeriod === 'month') {
      return Array.from({ length: 30 }, (_, i) => {
        const date = new Date(viewStartDate);
        date.setDate(viewStartDate.getDate() - 29 + i);
        return i % 5 === 0 ? date.getDate().toString() : '';
      });
    }


    return []; // fallback
  }, [viewPeriod, viewStartDate]);


  const handlePeriodChange = (period: 'day' | 'week' | 'month') => {
    setViewPeriod(period);

    const today = new Date();
    if (period === 'day') {
      today.setDate(today.getDate() - 1); // still show yesterday for day view
    }

    setViewStartDate(today);
  };



  // Update viewStartDate daily (e.g., at midnight)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [viewStartDate]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.totalPuffCircleContainer}>
        <View style={styles.totalPuffCircle}>
          <Text style={styles.totalPuffNumber}>{totalPuffsRecorded}</Text>
          <Text style={styles.totalPuffLabel}>All time</Text>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <View style={{ position: 'relative' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(viewStartDate);
              const offset = viewPeriod === 'day' ? -1 : viewPeriod === 'week' ? -7 : -30;
              newDate.setDate(newDate.getDate() + offset);
              if (newDate >= firstLoginDate) setViewStartDate(newDate);
            }}
            style={{ marginHorizontal: 20 }}
          >
            <Text style={{ fontSize: 24, color: '#ffffff' }}>←</Text>
          </TouchableOpacity>

          <Text style={{ color: '#ffffff', fontSize: 16 }}>
            {viewPeriod === 'day' && (isYesterday(viewStartDate) ? 'Yesterday' : formatDate(viewStartDate))}
            {viewPeriod === 'week' &&
              `${formatDate(new Date(viewStartDate.getTime() - 6 * 86400000))} - ${formatDate(viewStartDate)}`}
            {viewPeriod === 'month' &&
              `${formatDate(new Date(viewStartDate.getTime() - 29 * 86400000))} - ${formatDate(viewStartDate)}`}
          </Text>

          <TouchableOpacity
            disabled={(() => {
              const today = new Date();
              today.setDate(today.getDate() - 1); // yesterday
              return viewStartDate >= today;
            })()}
            onPress={() => {
              const newDate = new Date(viewStartDate);
              const offset = viewPeriod === 'day' ? 1 : viewPeriod === 'week' ? 7 : 30;
              newDate.setDate(newDate.getDate() + offset);
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              if (newDate <= yesterday) setViewStartDate(newDate);
            }}
            style={{ marginHorizontal: 20, opacity: (() => {
              const today = new Date();
              today.setDate(today.getDate() - 1);
              return viewStartDate >= today ? 0.3 : 1;
            })() }}
          >
            <Text style={{ fontSize: 24, color: '#ffffff' }}>→</Text>
          </TouchableOpacity>
        </View>
        {puffHistory.length > 0 && puffHistory.length === labels.length && (
        <LineChart
          data={{
            labels: labels,
            datasets: [{
              data: puffHistory.map(v => (isFinite(v) ? v : 0)),
            }],
          }}
          width={screenWidth - 20} // Reduce width slightly to accommodate the shift
          height={220}
          bezier
          yAxisLabel=""
          withDots={false}
          withHorizontalLines={viewPeriod === 'week'|| viewPeriod === 'day'|| viewPeriod === 'month' ? false : true} // Remove horizontal lines for week
          withVerticalLines={viewPeriod === 'week'|| viewPeriod === 'day'|| viewPeriod === 'month' ? false : true} // Remove vertical lines for week
          chartConfig={{
          backgroundColor: '#161618',
          backgroundGradientFrom: '#161618',
          backgroundGradientTo: '#161618',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 0, 0, 1)`, // white for labels and axes
          labelColor: (opacity = 1) => `rgba(255, 255, 255, 1)`, // white labels
          propsForBackgroundLines: {
            stroke: '#ffffff', // faded white for grid lines (optional)
          },
          style: { borderRadius: 16 },
        }}

          style={{ ...styles.chart, marginLeft: 10 }} // Merge styles into a single object
        />
        )}
        {isLoading && (
          <View style={styles.chartOverlay}>
            <ActivityIndicator size="small" color="#e50000" />
          </View>
        )}
        </View>
      </View>
      <View style={styles.header}>
        <TouchableOpacity disabled={isLoading} onPress={() => handlePeriodChange('day')} style={[styles.periodButton, viewPeriod === 'day' && styles.activeButton]}>
          <Text style={styles.periodButtonText}>Day</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={isLoading} onPress={() => handlePeriodChange('week')} style={[styles.periodButton, viewPeriod === 'week' && styles.activeButton]}>
          <Text style={styles.periodButtonText}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={isLoading} onPress={() => handlePeriodChange('month')} style={[styles.periodButton, viewPeriod === 'month' && styles.activeButton]}>
          <Text style={styles.periodButtonText}>Month</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 80, backgroundColor: '#000000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  periodButton: { padding: 10, borderWidth: 1, borderRadius: 5, borderColor: '#212124 '},
  periodButtonText: {color: '#ffffff'},
  activeButton: { backgroundColor: '#e50000', color: '#ffffff' },
  chartContainer: { alignItems: 'center' },
  chart: { marginVertical: 8, borderRadius: 16 },
  totalPuffCircleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  totalPuffCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#212124',
    borderWidth: 2,
    borderColor: '#e50000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  totalPuffNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e50000',
  },

  totalPuffLabel: {
    fontSize: 12,
    color: '#ffffff',
    marginTop: 4,
  },
  chartOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -10,
    marginTop: -10,
  },
});

export default StatsScreen;
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator, Animated, Easing } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePuff } from '../context/PuffContext';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient'; // ✅ This is correct
import { useFocusEffect } from '@react-navigation/native';


const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / BASE_WIDTH) * size;
const verticalScale = (size: number) => (SCREEN_HEIGHT / BASE_HEIGHT) * size;


interface PuffEntry {
  time: string;
  strength: number;
}

const StatsScreen = () => {
  const [viewPeriod, setViewPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [totalPuffsRecorded, setTotalPuffsRecorded] = useState(0);
  const formatDate = (date: Date) => {
    if (isNaN(date.getTime())) return 'Invalid Date';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };
  const [prevPeriodPuffCount, setPrevPeriodPuffCount] = useState<number | null>(null);
  const [changeMap, setChangeMap] = useState<{ day: number | null; week: number | null; month: number | null }>({
    day: null,
    week: null,
    month: null,
  });



  const scrollRef = useRef<ScrollView | null>(null);
  const [scrollPageWidth, setScrollPageWidth] = useState(Dimensions.get('window').width);
  const chartWidth = scrollPageWidth;                // for LineChart width
  const [isChartReady, setIsChartReady] = useState(false);
  const [avgDailyPuffsFromUser, setAvgDailyPuffsFromUser] = useState<number | null>(null);
  const [savedMap, setSavedMap] = useState<{ day: number; week: number; month: number, year: number }>({
    day: 0,
    week: 0,
    month: 0,
    year: 0,
  });
  const { puffCount } = usePuff();
  const underlineAnim = useRef(new Animated.Value(0)).current; 






  const scrollToView = (period: 'day' | 'week' | 'month' | 'year') => {
    const index =
      period === 'day' ? 0 :
      period === 'week' ? 1 :
      period === 'month' ? 2 :
      3; // year

    if (!isChartReady || !scrollRef.current || scrollPageWidth === 0) {
      console.warn('Scroll not ready');
      return;
    }

    // 🔁 Animate underline to the new index
    Animated.spring(underlineAnim, {
      toValue: index,
      useNativeDriver: true,
    }).start();

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: scrollPageWidth * index,
        animated: true,
      });

      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: scrollPageWidth * index,
          animated: true,
        });
      }, 50);
    });
  };



  const [chartDataMap, setChartDataMap] = useState<{
    day: { data: number[]; labels: string[] };
    week: { data: number[]; labels: string[] };
    month: { data: number[]; labels: string[] };
    year: { data: number[]; labels: string[] };
  }>({
    day: { data: [], labels: [] },
    week: { data: [], labels: [] },
    month: { data: [], labels: [] },
    year: { data: [], labels: [] },
  });






  const [statsMap, setStatsMap] = useState<{
    [key in 'day' | 'week' | 'month' | 'year']: {
      total: number;
      avg: number;
      change: number | null;
    };
  }>({
    day: { total: 0, avg: 0, change: null },
    week: { total: 0, avg: 0, change: null },
    month: { total: 0, avg: 0, change: null },
    year: { total: 0, avg: 0, change: null },
  });




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


  const [firstLoginDate, setFirstLoginDate] = useState<Date | null>(null);

  const daysSinceLogin = useMemo(() => {
    if (!firstLoginDate) return 0; // Default to 0
    const today = new Date();
    return Math.max(
      Math.floor((today.getTime() - firstLoginDate.getTime()) / (1000 * 60 * 60 * 24)),
      1
    );
  }, [firstLoginDate]);





  useEffect(() => {
    const fetchStartDate = async () => {
      const stored = await AsyncStorage.getItem('startDate');
      if (stored) {
        setFirstLoginDate(new Date(stored));
      } else {
        setFirstLoginDate(new Date()); // fallback to today
      }
    };
    fetchStartDate();
  }, []);



  useEffect(
    React.useCallback(() => {
    const loadAllCharts = async () => {
      const baseDate = new Date();
      

      const fetchData = async (period: 'day' | 'week' | 'month' | 'year') => {
        let labels: string[] = [];
        let data: number[] = [];
        let entries: PuffEntry[] = [];
        const dates: string[] = [];

        const viewStart = new Date(baseDate);
        if (period === 'day') {
          const d = new Date(viewStart);
          dates.push(d.toISOString().split('T')[0]);
          labels = Array.from({ length: 24 }, (_, i) => (i % 4 === 0 ? i.toString() : ''));
          data = Array(24).fill(0);
        } else if (period === 'week') {
          for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - 6 + i); // includes today at i=29
            dates.push(d.toISOString().split('T')[0]);
          }
          labels = dates.map(d => {
            const day = new Date(d).getDay();
            return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
          });
          data = Array(7).fill(0);
        } else if (period === 'month'){
          for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - 29 + i); // includes today at i=29
            dates.push(d.toISOString().split('T')[0]);
          }
          labels = dates.map((d, i) => {
            const parsed = new Date(d);
            const shouldLabel = (29 - i) % 5 === 0 || i === 0; // Add label at far left
            return shouldLabel ? parsed.getDate().toString() : '';
          });


          data = Array(30).fill(0);
        } else {
          
          const today = new Date(); // ✅ Fix: declare today here
          const months: string[] = [];
          const monthLabels: string[] = [];
          const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          for (let i = 11; i >= 0; i--) {
            const d = new Date(today);
            d.setMonth(today.getMonth() - i);
            const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
            months.push(key);

            // Show every second month label, including the most recent
            const showLabel = (11 - i) % 2 === 0 || i === 0;
            monthLabels.push(showLabel ? shortMonths[d.getMonth()] : '');
          }

          labels = monthLabels;
          data = Array(12).fill(0);

          for (const key of months) {
            const keys = await AsyncStorage.getAllKeys();
            const matching = keys.filter(k => k.startsWith('puffTimes-') && k.includes(key));
            for (const match of matching) {
              const json = await AsyncStorage.getItem(match);
              if (json) {
                try {
                  const parsed = JSON.parse(json);
                  entries.push(...parsed);
                } catch {}
              }
            }
          }

          months.forEach((month, i) => {
            const count = entries.filter(e => e.time.startsWith(month)).length;
            data[i] = count;
          });
        }

        for (const date of dates) {
          const raw = await AsyncStorage.getItem(`puffTimes-${date}`);
          if (raw) {
            try {
              entries = [...entries, ...JSON.parse(raw)];
            } catch {}
          }
        }

        // Fill data
        if (period === 'day') {
          const dayStr = dates[0];
          entries.forEach(e => {
            const d = new Date(e.time);
            if (d.toISOString().split('T')[0] === dayStr) {
              data[d.getHours()] += 1;
            }
          });
        } else {
          dates.forEach((dateStr, i) => {
            data[i] = entries.filter(e => e.time.startsWith(dateStr)).length;
          });
        }

        const safeData = data.map((val) =>
          typeof val === 'number' && Number.isFinite(val) ? val : 0
        );

        

        return { data: safeData, labels };

      };

      const [day, week, month, year] = await Promise.all([
        fetchData('day'),
        fetchData('week'),
        fetchData('month'),
        fetchData('year'),
      ]);

      setChartDataMap({ day, week, month, year });
    };

    loadAllCharts();

    return () => {}; // cleanup if needed
    }, [])
  );

  useFocusEffect(
  React.useCallback(() => {
    let isActive = true; // prevent state updates if screen is unfocused

    const calculateStatsForPeriod = async (period: 'day' | 'week' | 'month' | 'year') => {
      const viewStart = new Date();
      const periodLength = period === 'day' ? 1 : period === 'week' ? 7 : 30;
      const compareSingleDays = period === 'day';

      const currentDates: string[] = [];
      const prevDates: string[] = [];

      if (compareSingleDays) {
        const today = new Date();
        currentDates.push(today.toISOString().split('T')[0]);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        prevDates.push(yesterday.toISOString().split('T')[0]);
      } else {
        for (let i = 0; i < periodLength; i++) {
          const d = new Date(viewStart);
          d.setDate(viewStart.getDate() - periodLength + 1 + i);
          currentDates.push(d.toISOString().split('T')[0]);

          const pd = new Date(viewStart);
          pd.setDate(viewStart.getDate() - 2 * periodLength + 1 + i);
          prevDates.push(pd.toISOString().split('T')[0]);
        }
      }

      let currentCount = 0;
      let prevCount = 0;

      for (const date of currentDates) {
        const json = await AsyncStorage.getItem(`puffTimes-${date}`);
        if (json) {
          try {
            const entries = JSON.parse(json);
            currentCount += Array.isArray(entries) ? entries.length : 0;
          } catch {}
        }
      }

      for (const date of prevDates) {
        const json = await AsyncStorage.getItem(`puffTimes-${date}`);
        if (json) {
          try {
            const entries = JSON.parse(json);
            prevCount += Array.isArray(entries) ? entries.length : 0;
          } catch {}
        }
      }

      const change =
        prevCount === 0 && currentCount === 0
          ? 0
          : prevCount === 0
          ? 0
          : Math.round(((currentCount - prevCount) / prevCount) * 100);

      const today = new Date();
      const daysSinceStart = firstLoginDate
        ? Math.max(
            Math.floor((today.getTime() - firstLoginDate.getTime()) / (1000 * 60 * 60 * 24)),
            1
          )
        : 1;

      const avg =
        period === 'day'
          ? totalPuffsRecorded / daysSinceStart
          : period === 'week'
          ? totalPuffsRecorded / Math.ceil(daysSinceStart / 7)
          : totalPuffsRecorded / Math.ceil(daysSinceStart / 30);

      return {
        total: currentCount,
        avg: Math.round(avg),
        change,
      };
    };

    const loadAllStats = async () => {
      const [day, week, month, year] = await Promise.all([
        calculateStatsForPeriod('day'),
        calculateStatsForPeriod('week'),
        calculateStatsForPeriod('month'),
        calculateStatsForPeriod('year'),
      ]);

      if (isActive) {
        setStatsMap({ day, week, month, year });
      }
    };

    const calculateAmountSavedForPeriod = (
      period: 'day' | 'week' | 'month' | 'year',
      periodPuffs: number,
      avgDailyPuffs: number
    ) => {
      const days = period === 'day' ? 1 : period === 'week' ? 7 : period === 'month' ? 30 : 365;
      const expectedPuffs = avgDailyPuffs * days;
      const originalCost = (expectedPuffs / 500) * 10;
      const adjustedCost = (periodPuffs / 500) * 10;
      return parseFloat((originalCost - adjustedCost).toFixed(2));
    };

    const calculateAmountSavedAll = () => {
      const avgDaily = avgDailyPuffsFromUser ?? (totalPuffsRecorded / daysSinceLogin);
      const map = {
        day: calculateAmountSavedForPeriod(
          'day',
          chartDataMap.day.data.reduce((a, b) => a + b, 0),
          avgDaily
        ),
        week: calculateAmountSavedForPeriod(
          'week',
          chartDataMap.week.data.reduce((a, b) => a + b, 0),
          avgDaily
        ),
        month: calculateAmountSavedForPeriod(
          'month',
          chartDataMap.month.data.reduce((a, b) => a + b, 0),
          avgDaily
        ),
        year: calculateAmountSavedForPeriod(
          'year',
          chartDataMap.year.data.reduce((a, b) => a + b, 0),
          avgDaily
        ),
      };

      if (isActive) {
        setSavedMap(map);
      }
    };

    loadAllStats();
    calculateAmountSavedAll();

    return () => {
      isActive = false; // cancel updates after unmount
    };
  }, []) // ✅ empty deps: runs only on screen focus
);


  useEffect(() => {
    const getPrevPeriodKeyDates = () => {
      const end = new Date(viewStartDate);
      const start = new Date(viewStartDate);
      if (viewPeriod === 'week') {
        start.setDate(start.getDate() - 7);
        end.setDate(end.getDate() - 1);
      } else if (viewPeriod === 'month') {
        start.setDate(start.getDate() - 30);
        end.setDate(end.getDate() - 1);
      } else {
        start.setDate(start.getDate() - 2);
      }
      return { start, end };
    };

    const loadPrevPeriod = async () => {
      const { start } = getPrevPeriodKeyDates();
      const prevDates: string[] = [];

      const days = viewPeriod === 'day' ? 1 : viewPeriod === 'week' ? 7 : 30;
      for (let i = 0; i < days; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        prevDates.push(d.toISOString().split('T')[0]);
      }

      let count = 0;
      for (const date of prevDates) {
        const json = await AsyncStorage.getItem(`puffTimes-${date}`);
        if (json) {
          try {
            const entries = JSON.parse(json);
            count += Array.isArray(entries) ? entries.length : 0;
          } catch {}
        }
      }

      setPrevPeriodPuffCount(count);
    };

    loadPrevPeriod();
  }, [viewPeriod, viewStartDate]);


  useEffect(
    React.useCallback(() => {
    const calculateTotalPuffs = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const today = new Date();
        const todayKey = today.toISOString().split('T')[0];

        const puffKeys = keys.filter(key => {
          if (!key.startsWith('puffTimes-')) return false;
          const datePart = key.split('puffTimes-')[1];
          return new Date(datePart) <= today;
        });



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
    
    return () => {}; // cleanup if needed
  }, [])
);


  useEffect(() => {
    const loadAvgDailyPuffs = async () => {
      try {
        const stored = await AsyncStorage.getItem('avgDailyPuffs');
        if (stored !== null) {
          const parsed = parseFloat(stored);
          if (!isNaN(parsed)) {
            setAvgDailyPuffsFromUser(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to load avgDailyPuffs:', error);
      }
    };

    loadAvgDailyPuffs();
  }, []);



  const cardData = useMemo(() => {
    const totalPeriodPuffs = chartDataMap[viewPeriod].data.reduce((sum, v) => sum + v, 0);

    // Calculate days since first login for average
      const today = new Date();
      const daysSinceStart = firstLoginDate
        ? Math.max(
            Math.floor((today.getTime() - firstLoginDate.getTime()) / (1000 * 60 * 60 * 24)),
            1
          )
        : 1;

    const avgDailyPuffs = avgDailyPuffsFromUser ?? (totalPuffsRecorded / daysSinceStart);
    const expectedPeriodPuffs =
      viewPeriod === 'day'
        ? avgDailyPuffs * 1
        : viewPeriod === 'week'
          ? avgDailyPuffs * 7
          : avgDailyPuffs * 30;

    const originalCost = (expectedPeriodPuffs / 500) * 10;
    const adjustedCost = (totalPeriodPuffs / 500) * 10;
    const amountSaved = parseFloat((originalCost - adjustedCost).toFixed(2));


    const change =
      prevPeriodPuffCount === null
        ? null
        : prevPeriodPuffCount === 0 && totalPeriodPuffs === 0
          ? 0
          : prevPeriodPuffCount === 0
            ? 0
            : Math.round(((totalPeriodPuffs) / prevPeriodPuffCount) * 100);


    return {
      totalPeriodPuffs,
      amountSaved,
      allTime: totalPuffsRecorded,
      changePercent: change,
    };
  }, [chartDataMap, totalPuffsRecorded, firstLoginDate, viewPeriod, prevPeriodPuffCount]);


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
        const date = new Date();
        date.setDate(date.getDate() - (29 - i)); // i=0 => 29 days ago, i=29 => today
        return (29 - i) % 5 === 0 ? date.getDate().toString() : '';
      });
    }



    return []; // fallback
  }, [viewPeriod, viewStartDate]);




  const handlePeriodChange = (period: 'day' | 'week' | 'month' | 'year') => {
    setViewPeriod(period);

    const today = new Date();
    if (period === 'day') {
      today.setDate(today.getDate() - 1);
    }

    setViewStartDate(today);
  };


  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fadeAnim.setValue(0.3); // start dimmed

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      delay: 100, // slight delay makes it more natural
      easing: Easing.bezier(0.4, 0.0, 0.2, 1), // softer curve
      useNativeDriver: true,
    }).start();
  }, [viewPeriod]);


  


  return (
    <View style={[styles.container, { flex: 1 }]}>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => scrollToView('day')}
          style={[
            styles.periodButton,
            viewPeriod === 'day' && styles.activePeriodButton, // Highlight active
          ]}
        >
          <Text
            style={[
              styles.periodButtonText,
              viewPeriod === 'day' && styles.activePeriodButtonText,
            ]}
          >
            1 Day
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => scrollToView('week')}
          style={[
            styles.periodButton,
            viewPeriod === 'week' && styles.activePeriodButton, // Highlight active
          ]}
        >
          <Text
            style={[
              styles.periodButtonText,
              viewPeriod === 'week' && styles.activePeriodButtonText,
            ]}
          >
            7 Days
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => scrollToView('month')}
          style={[
            styles.periodButton,
            viewPeriod === 'month' && styles.activePeriodButton, // Highlight active
          ]}
        >
          <Text
            style={[
              styles.periodButtonText,
              viewPeriod === 'month' && styles.activePeriodButtonText,
            ]}
          >
            30 Days
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => scrollToView('year')}
          style={[
            styles.periodButton,
            viewPeriod === 'year' && styles.activePeriodButton, // Highlight active
          ]}
        >
          <Text
            style={[
              styles.periodButtonText,
              viewPeriod === 'year' && styles.activePeriodButtonText,
            ]}
          >
            365 Days
          </Text>
        </TouchableOpacity>
      </View>


      <View style={{ minHeight: 540, justifyContent: 'flex-start' }}>
      <View style={styles.chartContainer}>
        <View style={{ height: 500 }} onLayout={(e) => {
            const width = e.nativeEvent.layout.width;
            if (width > 0) {
              setScrollPageWidth(width);
              setIsChartReady(true); // ✅ trigger ready
            }
          }}>
          <ScrollView
            horizontal
            pagingEnabled
            scrollEnabled={false}
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / scrollPageWidth);
              const period = ['day', 'week', 'month', 'year'][index] as 'day' | 'week' | 'month' | 'year';

              // Only update if changed
              if (period !== viewPeriod) {
                handlePeriodChange(period);
              }
            }}

          >
            {(['day', 'week', 'month', 'year'] as const).map((period) => {
              const { data, labels } = chartDataMap[period];

              /*console.log('Rendering chart for', period, {
                data,
                labels,
                safe: data.every(n => typeof n === 'number' && Number.isFinite(n))
              });*/

              if (!data.length || !labels.length) {
                return (
                  <View key={period} style={{ width: scrollPageWidth, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: 'white' }}>No data for {period}</Text>
                  </View>
                );
              }

              const { allTime } = cardData;
              const { total, avg, change } = statsMap[period];


              return (
                <View
                  key={period}
                  style={{
                  width: scrollPageWidth,
                  alignItems: 'center', // ✅ THIS centers inner content
                  }}
                  >
                  <Text style={styles.periodTitle}>
                    {period === 'day'
                      ? 'Today'
                      : period === 'week'
                        ? 'Last 7 days'
                      : period === 'month'
                        ? 'Last 30 days'
                        : 'Last Year'}
                  </Text>

                      <View style={{ flex: 1, alignItems: 'center' }}>
                        <LineChart
                          data={{
                            labels: labels,
                            datasets: [
                              {
                                data: data,
                                color: () => '#EF4444',
                                strokeWidth: 2,
                              },
                            ],
                          }}
                          width={scrollPageWidth * 0.9}
                          height={220}
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
                            borderRadius: 16,
                          }}
                        />
                      </View>

                
                   

              {/* 🧠 Stat cards for this period */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 }}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total ({period})</Text>
                  <Text style={styles.statValue}>{total}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>All Time</Text>
                  <Text style={styles.statValue}>{allTime}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Saved</Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: savedMap[period] >= 0 ? '#00d600' : '#e50000' },
                    ]}
                  >
                    ${Math.abs(savedMap[period]).toFixed(2)}
                  </Text>
                </View>
                {change !== null && (
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>
                    {period === 'day'
                      ? 'vs yesterday'
                      : period === 'week'
                        ? 'vs prev 7 days'
                      : period === 'month'
                        ? 'vs prev 30 days'
                        : 'vs prev year'}
                    </Text>
                    <Text
                      style={[
                        styles.statValue,
                        {
                          color:
                            change > 0
                              ? '#e50000' // 🔺 Red for increase
                              : change < 0
                                ? '#00d600' // 🟢 Green for decrease
                                : '#ffffff', // Neutral (0%)
                        },
                      ]}
                    >
                      {change > 0 ? `+${change}%` : change < 0 ? `${change}%` : '0%'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
          })}
          </ScrollView>
        </View>
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingBottom: verticalScale(20),
    paddingTop: verticalScale(20),
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: verticalScale(20),
  },
  periodButton: {
    paddingVertical: scale(6),
    paddingHorizontal: scale(12),
    marginHorizontal: scale(4),
    borderRadius: scale(6),
    backgroundColor: '#000',
  },
  periodButtonText: {
    color: '#fff',
    fontSize: scale(14),
    fontWeight: '600',
  },

  activeButton: {
    backgroundColor: '#e50000',
    color: '#ffffff',
  },
  chartContainer: {
    alignItems: 'center',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#020202',
    padding: scale(12),
    borderRadius: scale(8),
    marginBottom: verticalScale(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    color: '#ffffff',
    fontSize: scale(12),
    marginBottom: verticalScale(4),
    textAlign: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: scale(18),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  periodTitle: {
    color: '#ffffff',
    fontSize: scale(16),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: verticalScale(10),
  },
  appTitle: {
    fontSize: scale(28),
    fontWeight: 'bold',
  },
  vapeText: {
    color: '#FF3333',
  },
  freeText: {
    color: '#FFFFFF',
  },
  titleContainer: {
    marginBottom: verticalScale(20),
  },
  activePeriodButton: {
    backgroundColor: '#ffffff',
  },
  activePeriodButtonText: {
    color: '#000000',
  },

});


export default StatsScreen;
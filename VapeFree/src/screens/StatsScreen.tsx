import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, ActivityIndicator, Animated, Easing } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePuff } from '../context/PuffContext';


interface PuffEntry {
  time: string;
  strength: number;
}

const StatsScreen = () => {
  const [viewPeriod, setViewPeriod] = useState<'day' | 'week' | 'month'>('day');
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


  const scrollToView = (period: 'day' | 'week' | 'month') => {
    const index = period === 'day' ? 0 : period === 'week' ? 1 : 2;

    if (!isChartReady || !scrollRef.current || scrollPageWidth === 0) {
      console.warn('Scroll not ready');
      return;
    }

    console.log(`🔁 Scrolling to: ${period} (index ${index})`);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: scrollPageWidth * index,
        animated: true,
      });

      // ⏱ Trigger a second scroll to ensure it lands (Android quirk)
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
  }>({
    day: { data: [], labels: [] },
    week: { data: [], labels: [] },
    month: { data: [], labels: [] },
  });





  const [statsMap, setStatsMap] = useState<{
    [key in 'day' | 'week' | 'month']: {
      total: number;
      avg: number;
      change: number | null;
    };
  }>({
    day: { total: 0, avg: 0, change: null },
    week: { total: 0, avg: 0, change: null },
    month: { total: 0, avg: 0, change: null },
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


  const [firstLoginDate, setFirstLoginDate] = useState<Date>(() => {
    // Replace this with your actual value from AsyncStorage if needed
    return new Date('2024-01-01'); // first login fallback
  });


  useEffect(() => {
    const loadAllCharts = async () => {
      const baseDate = new Date();
      

      const fetchData = async (period: 'day' | 'week' | 'month') => {
        let labels: string[] = [];
        let data: number[] = [];
        let entries: PuffEntry[] = [];
        const dates: string[] = [];

        const viewStart = new Date(baseDate);
        if (period === 'day') {
          const d = new Date(viewStart);
          d.setDate(d.getDate() - 1);
          dates.push(d.toISOString().split('T')[0]);
          labels = Array.from({ length: 24 }, (_, i) => (i % 4 === 0 ? i.toString() : ''));
          data = Array(24).fill(0);
        } else if (period === 'week') {
          for (let i = 0; i < 7; i++) { // week
            const d = new Date(viewStart);
            d.setDate(d.getDate() - 6 + i); // oldest first
            dates.push(d.toISOString().split('T')[0]);
          }
          labels = dates.map(d => {
            const day = new Date(d).getDay();
            return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];
          });
          data = Array(7).fill(0);
        } else {
          for (let i = 0; i < 30; i++) { // month
            const d = new Date(viewStart);
            d.setDate(d.getDate() - 29 + i); // oldest first
            dates.push(d.toISOString().split('T')[0]);
          }
          labels = dates.map((d, i) => {
            const parsed = new Date(d);
            return Number.isFinite(parsed.getTime()) && i % 5 === 0 ? parsed.getDate().toString() : '';
          });
          data = Array(30).fill(0);
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

      const [day, week, month] = await Promise.all([
        fetchData('day'),
        fetchData('week'),
        fetchData('month'),
      ]);

      setChartDataMap({ day, week, month });
    };

    loadAllCharts();
  }, []);

  useEffect(() => {
    const calculateStatsForPeriod = async (period: 'day' | 'week' | 'month') => {
      const now = new Date();
      const viewStart = new Date();
      const periodLength = period === 'day' ? 1 : period === 'week' ? 7 : 30;

      const currentDates: string[] = [];
      const prevDates: string[] = [];

      for (let i = 0; i < periodLength; i++) {
        const d = new Date(viewStart);
        d.setDate(viewStart.getDate() - periodLength + i);
        currentDates.push(d.toISOString().split('T')[0]);

        const pd = new Date(viewStart);
        pd.setDate(viewStart.getDate() - 2 * periodLength + i);
        prevDates.push(pd.toISOString().split('T')[0]);
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
            : Math.round((currentCount / prevCount) * 100);

      // Calculate days since first login for average
      const today = new Date();
      const daysSinceStart = Math.max(
        Math.floor((today.getTime() - firstLoginDate.getTime()) / (1000 * 60 * 60 * 24)),
        1
      );

      const avg = period === 'day'
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
      const [day, week, month] = await Promise.all([
        calculateStatsForPeriod('day'),
        calculateStatsForPeriod('week'),
        calculateStatsForPeriod('month'),
      ]);

      setStatsMap({ day, week, month });
    };

    loadAllStats();
  }, [firstLoginDate, totalPuffsRecorded]);

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


  const cardData = useMemo(() => {
    const totalPeriodPuffs = chartDataMap[viewPeriod].data.reduce((sum, v) => sum + v, 0);

    const today = new Date();
    const daysSinceStart = Math.max(
      Math.floor((today.getTime() - firstLoginDate.getTime()) / (1000 * 60 * 60 * 24)),
      1
    );

    const avgPerPeriod = viewPeriod === 'day'
      ? totalPuffsRecorded / daysSinceStart
      : viewPeriod === 'week'
        ? totalPuffsRecorded / Math.ceil(daysSinceStart / 7)
        : totalPuffsRecorded / Math.ceil(daysSinceStart / 30);

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
      avgPerPeriod: Math.round(avgPerPeriod),
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
      <View style={styles.titleContainer}>
        <Text style={styles.appTitle}>
          <Text style={styles.freeText}>Puff</Text>
          <Text style={styles.vapeText}>Daddy</Text>
        </Text>
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
            ref={scrollRef}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / scrollPageWidth);
              const period = ['day', 'week', 'month'][index] as 'day' | 'week' | 'month';

              // Only update if changed
              if (period !== viewPeriod) {
                handlePeriodChange(period);
              }
            }}

          >
            {(['day', 'week', 'month'] as const).map((period) => {
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
                <View key={period} style={{ width: scrollPageWidth, justifyContent: 'center' }}>
                  <Text style={styles.periodTitle}>
                    {period === 'day'
                      ? 'Yesterday'
                      : period === 'week'
                        ? 'Last 7 days'
                        : 'Last 30 days'}
                  </Text>
                    <LineChart
                      data={{
                        labels,
                        datasets: [{ data }],
                      }}
                      width={chartWidth}
                      height={220}
                      bezier
                      yAxisInterval={1}
                      fromZero={true}
                      withDots={false}
                      withHorizontalLines={false}
                      withVerticalLines={false}
                      chartConfig={{
                        backgroundColor: '#161618',
                        backgroundGradientFrom: '#161618',
                        backgroundGradientTo: '#161618',
                        decimalPlaces: 0,
                        color: () => `rgba(255, 0, 0, 1)`,
                        labelColor: () => `rgba(255, 255, 255, 1)`,
                        propsForBackgroundLines: { stroke: '#ffffff' },
                        style: { borderRadius: 16 },
                      }}
                      style={{ marginLeft: 0 }}
                    />
                
                   

              {/* 🧠 Stat cards for this period */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 }}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Total ({period})</Text>
                  <Text style={styles.statValue}>{total}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Avg/{period}</Text>
                  <Text style={styles.statValue}>{Math.round(avg)}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>All Time</Text>
                  <Text style={styles.statValue}>{allTime}</Text>
                </View>
                {change !== null && (
                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Change</Text>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => scrollToView('day')} style={[styles.periodButton]}>
          <Text style={styles.periodButtonText}>1 Day</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToView('week')} style={[styles.periodButton]}>
          <Text style={styles.periodButtonText}>7 Days</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => scrollToView('month')} style={[styles.periodButton]}>
          <Text style={styles.periodButtonText}>30 Days</Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 40, backgroundColor: '#000000', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  periodButton: { padding: 10, borderWidth: 1, borderRadius: 5, borderColor: '#212124 '},
  periodButtonText: {color: '#ffffff'},
  activeButton: { backgroundColor: '#e50000', color: '#ffffff' },
  chartContainer: { alignItems: 'center' },
  statCard: {
    width: '48%',
    backgroundColor: '#212124',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  statLabel: {
    color: '#ffffff',
    fontSize: 12,
    marginBottom: 4,
  },

  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  periodTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
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
});

export default StatsScreen;
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePuff } from '../context/PuffContext';
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
  const [totalPuffsRecorded, setTotalPuffsRecorded] = useState(0);


  const [avgDailyPuffsFromUser, setAvgDailyPuffsFromUser] = useState<number | null>(null);
  const { puffCount } = usePuff();
  const [firstLoginDate, setFirstLoginDate] = useState<Date | null>(null); 


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
              } catch {}
            }
          }

          setTotalPuffsRecorded(total);
        } catch (error) {
          console.error('Error calculating total puffs:', error);
        }
      };

      calculateTotalPuffs();

      return () => {};
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



  const [allTimePuffCount, setAllTimePuffCount] = useState<number | null>(null);

  useEffect(() => {
    const calculateAllTimeFromChart = () => {
      // Get unique puff counts across all periods
      // BUT avoid summing same puffs from day/week/month/year (they overlap)
      // So instead, just pull all puff keys from AsyncStorage
      const loadAccurateAllTime = async () => {
        try {
          const keys = await AsyncStorage.getAllKeys();
          const puffKeys = keys.filter((key) => key.startsWith('puffTimes-'));
          let total = 0;

          for (const key of puffKeys) {
            const json = await AsyncStorage.getItem(key);
            if (json) {
              try {
                const entries = JSON.parse(json);
                if (Array.isArray(entries)) {
                  total += entries.length;
                }
              } catch {}
            }
          }

          setAllTimePuffCount(total);
        } catch (err) {
          console.error('Failed to load all time puff count:', err);
        }
      };

      loadAccurateAllTime();
    };

    calculateAllTimeFromChart();
  }, [chartDataMap]); // ✅ will re-run when puff count changes




  const calculateStatsForPeriod = async (
    period: 'day' | 'week' | 'month' | 'year'
  ) => {
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








  useEffect(() => {
    const loadAllStats = async () => {
      const [day, week, month, year] = await Promise.all([
        calculateStatsForPeriod('day'),
        calculateStatsForPeriod('week'),
        calculateStatsForPeriod('month'),
        calculateStatsForPeriod('year'),
      ]);
      setStatsMap({ day, week, month, year });
    };

    loadAllStats();
  }, [chartDataMap]);





  


  return (
    <View style={[styles.container, { flex: 1 }]}>

      

      <View style={{ minHeight: SCREEN_HEIGHT * 0.65, justifyContent: 'flex-start' }}>
      <View style={styles.chartContainer}>
        <View style={{ height: SCREEN_HEIGHT * 0.65, width: '100%' }}>
          <ScrollView showsVerticalScrollIndicator={true}>
            {(['day', 'week', 'month', 'year'] as const).map((period) => {
              const { data, labels } = chartDataMap[period];
              const { total, avg, change } = statsMap[period];

              if (!data.length || !labels.length) {
                return (
                  <View key={period} style={{ marginBottom: 40, alignItems: 'center' }}>
                    <Text style={{ color: 'white' }}>No data for {period}</Text>
                  </View>
                );
              }

              return (
                <View key={period} style={{ marginBottom: 40, alignItems: 'center' }}>
                  <Text style={styles.periodTitle}>
                    {period === 'day'
                      ? 'Today'
                      : period === 'week'
                        ? 'Last 7 days'
                        : period === 'month'
                          ? 'Last 30 days'
                          : 'Last Year'}
                  </Text>

                  <View
                    style={{
                      width: SCREEN_WIDTH * 0.9,
                      borderRadius: 16,
                      overflow: 'hidden',
                      backgroundColor: '#000',
                      paddingRight: scale(35),
                    }}
                  >
                    <LineChart
                      data={{
                        labels,
                        datasets: [
                          {
                            data,
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

                  {/* Cards */}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, width: '100%' }}>
                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Total ({period})</Text>
                      <Text style={styles.statValue}>
                        {chartDataMap[period]?.data?.reduce((a, b) => a + b, 0)}
                      </Text>
                    </View>

                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>All Time</Text>
                      <Text style={styles.statValue}>
                        {allTimePuffCount !== null ? allTimePuffCount : '...'}
                      </Text>
                    </View>

                    <View style={styles.statCard}>
                      <Text style={styles.statLabel}>Saved</Text>
                      {(() => {
                        const totalPuffs = chartDataMap[period]?.data?.reduce((a, b) => a + b, 0);
                        const avgDaily = avgDailyPuffsFromUser ?? 0;
                        const expected =
                          period === 'day'
                            ? avgDaily * 1
                            : period === 'week'
                            ? avgDaily * 7
                            : period === 'month'
                            ? avgDaily * 30
                            : avgDaily * 365;
                        const originalCost = (expected / 500) * 10;
                        const adjustedCost = (totalPuffs / 500) * 10;
                        const saved = originalCost - adjustedCost;

                        return (
                          <Text style={[styles.statValue, { color: saved >= 0 ? '#00d600' : '#e50000' }]}>
                            ${Math.abs(saved).toFixed(2)}
                          </Text>
                        );
                      })()}
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
                                change > 0 ? '#e50000' : change < 0 ? '#00d600' : '#ffffff',
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
  activePeriodButton: {
    backgroundColor: '#ffffff',
  },
  activePeriodButtonText: {
    color: '#000000',
  },

});


export default StatsScreen;
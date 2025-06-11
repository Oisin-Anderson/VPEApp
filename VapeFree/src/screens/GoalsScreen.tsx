import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Simulated chart data (time-based usage)
const chartData = [
  { time: '12 AM', value: 0 },
  { time: '5 PM', value: 0 },
  { time: '6 PM', value: 1 },
];

const HomeScreen = () => {
  const [puffCount, setPuffCount] = useState(1);
  const nicotineLevel = '0 mg';

  const handlePuff = () => {
    setPuffCount((prev) => prev + 1);
    // Add logic to update chart data or storage here
  };

  // Simplified chart component
  const SimpleChart = () => {
    const width = Dimensions.get('window').width - 40;
    const height = 150;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chart}>
          {chartData.map((point, index) => (
            <View
              key={index}
              style={{
                position: 'absolute',
                left: (index * (width / (chartData.length - 1))),
                bottom: 0,
                height: (point.value / 1) * height, // Scale value to chart height
                width: 2,
                backgroundColor: '#4A90E2',
              }}
            />
          ))}
        </View>
        <View style={styles.chartLabels}>
          {chartData.map((point, index) => (
            <Text key={index} style={styles.chartLabel}>
              {point.time}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Circular Counter */}
      <View style={styles.counterContainer}>
        <View style={styles.counterCircle}>
          <Text style={styles.counterText}>{puffCount}</Text>
          <Text style={styles.counterLabel}>PUFFS TODAY</Text>
          <Text style={styles.nicotineText}>{nicotineLevel}</Text>
          <Text style={styles.nicotineLabel}>NICOTINE</Text>
        </View>
      </View>

      {/* Usage Chart */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Usage today</Text>
        <SimpleChart />
      </View>

      {/* Puff Button */}
      <TouchableOpacity style={styles.puffButton} onPress={handlePuff}>
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.puffButtonText}>PUFF</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    paddingTop: 50,
  },
  counterContainer: {
    alignItems: 'center',
  },
  counterCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  counterText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  counterLabel: {
    fontSize: 16,
    color: '#888',
  },
  nicotineText: {
    fontSize: 20,
    color: '#F5A623',
    marginTop: 10,
  },
  nicotineLabel: {
    fontSize: 14,
    color: '#888',
  },
  chartSection: {
    width: '90%',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  chartContainer: {
    height: 150,
    justifyContent: 'flex-end',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '100%',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  chartLabel: {
    fontSize: 12,
    color: '#666',
  },
  puffButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  puffButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default HomeScreen;
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const scale = width / 375;

const FutureUpdatesScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Coming Soon</Text>
        <View style={styles.widgetContainer}>
            <Text style={styles.widgetText}>1. Widget</Text>
        </View>
        <View style={styles.widgetContainer}>
            <Text style={styles.widgetText}>And More!</Text>
        </View>
      </ScrollView>
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.closeButtonText}>Back to Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: height * 0.06,
    paddingHorizontal: width * 0.06,
  },
  scrollContent: {
    paddingBottom: height * 0.05,
  },
  header: {
    fontSize: scale * 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: height * 0.035,
    textAlign: 'center',
  },
  widgetContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.05,
    marginBottom: height * 0.02,
    alignItems: 'center',
  },
  widgetText: {
    color: '#fff',
    fontSize: scale * 18,
    fontWeight: '600',
  },
  buttonWrapper: {
    paddingBottom: height * 0.04,
    paddingHorizontal: width * 0.06,
    alignItems: 'center',
    marginBottom: height * 0.05,
  },
  closeButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.2,
    width: '100%',
  },
  closeButtonText: {
    color: '#000',
    fontSize: scale * 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default FutureUpdatesScreen; 
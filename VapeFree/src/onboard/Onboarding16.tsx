import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePuff } from '../context/PuffContext';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, verticalScale } from '../styles/choiceStyle';

const FINGERPRINT_SIZE = scale(48);

const Onboarding16 = () => {
  const navigation = useNavigation<any>();
  const [fingerPos, setFingerPos] = useState<{ x: number; y: number } | null>(null);
  const [hasTouched, setHasTouched] = useState(false);

  const handleContinue = () => {
    navigation.navigate('Onboarding17');
  };

  const goals = [
    "I'll take accountability for my actions",
    "I'll follow my quitting plan",
    "I'll keep hold of my money",
    "I'll stop Vaping once and for all",
  ];

  // Fingerprint area dimensions
  const FP_AREA_HEIGHT = verticalScale(140);
  const FP_AREA_WIDTH = '100%';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>
          Let's make a contract
        </Text>
        <View style={styles.goalList}>
          {goals.map((goal, index) => (
            <View style={styles.goalItem} key={index}>
              <MaskedView
                maskElement={
                  <Ionicons name="checkmark-circle" size={scale(24)} color="black" />
                }
              >
                <LinearGradient
                  colors={['#EF4444', '#3B82F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: scale(24), height: scale(24) }}
                />
              </MaskedView>
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}
        </View>
        {/* Fingerprint Section */}
        <Text style={styles.fpTitle}>Sign the contract with your fingerprint</Text>
        <Pressable
          style={styles.fingerprintArea}
          onPress={(e) => {
            const { locationX, locationY } = e.nativeEvent;
            setFingerPos({ x: locationX, y: locationY });
            setHasTouched(true);
          }}
        >
          <Text style={styles.fpTitleInside}>Sign the contract with your fingerprint</Text>
          {fingerPos && (
            <MaskedView
              style={{
                position: 'absolute',
                left: fingerPos.x - FINGERPRINT_SIZE / 2,
                top: fingerPos.y - FINGERPRINT_SIZE / 2,
                width: FINGERPRINT_SIZE,
                height: FINGERPRINT_SIZE,
              }}
              maskElement={
                <Ionicons
                  name="finger-print"
                  size={FINGERPRINT_SIZE}
                  color="black"
                  style={{ width: FINGERPRINT_SIZE, height: FINGERPRINT_SIZE }}
                />
              }
            >
              <LinearGradient
                colors={["#EF4444", "#3B82F6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: FINGERPRINT_SIZE, height: FINGERPRINT_SIZE }}
              />
            </MaskedView>
          )}
        </Pressable>
        <Text style={styles.fpDisclaimer}>*Your signature will not be recorded.</Text>
      </View>
      {hasTouched && (
        <View style={styles.buttonWrapper}>
          <LinearGradient
            colors={['#EF4444', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

export default Onboarding16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: verticalScale(60),
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: scale(30),
  },
  header: {
    color: '#fff',
    fontSize: scale(40),
    fontWeight: 'bold',
    lineHeight: scale(34),
    marginTop: 10,
    textAlign: 'left',
    marginBottom: verticalScale(16),
  },
  goalList: {
    width: '100%',
    marginTop: verticalScale(20),
    gap: 10,
    marginBottom: verticalScale(80),
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(10),
  },
  goalText: {
    color: '#fff',
    fontSize: scale(18),
    lineHeight: scale(24),
    flexShrink: 1,
    marginLeft: scale(6),
  },
  fpTitle: {
    height: 0,
  },
  fpTitleInside: {
    color: '#000',
    fontSize: scale(15),
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(6),
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  fingerprintArea: {
    width: '100%',
    height: verticalScale(200),
    backgroundColor: '#f6f6fa',
    borderRadius: scale(18),
    marginBottom: verticalScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  fpDisclaimer: {
    color: '#888',
    fontSize: scale(13),
    marginTop: verticalScale(2),
    marginBottom: verticalScale(8),
    alignSelf: 'center',
  },
  buttonWrapper: {
    marginTop: 'auto',
    paddingHorizontal: scale(30),
    width: '100%',
  },
  button: {
    paddingVertical: verticalScale(15),
    borderRadius: scale(30),
    width: '100%',
  },
  buttonText: {
    color: '#000',
    fontSize: scale(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  gradientButton: {
    borderRadius: scale(30),
    width: '100%',
    alignSelf: 'center',
    marginBottom: Platform.OS === 'android' ? 60 : 30,
  },
});
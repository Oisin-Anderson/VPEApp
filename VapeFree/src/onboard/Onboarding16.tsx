import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePuff } from '../context/PuffContext';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const Onboarding16 = () => {
  const navigation = useNavigation<any>();

  const handleContinue = () => {
    navigation.navigate('Onboarding18');
  };


  const goals = [
    'Reduce your daily puffs by at least 50%',
    'Become 30% more focused as nicotine fades',
    'Lower your cravings by identifying top triggers',
    'Feel less shortness of breath after light exercise',
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Based on your data. This first week, Puff Daddy can help you:
      </Text>

      <View style={styles.goalList}>
        {goals.map((goal, index) => (
          <View style={styles.goalItem} key={index}>
            <MaskedView
              maskElement={
                <Ionicons name="checkmark-circle" size={24} color="black" />
              }
            >
              <LinearGradient
                colors={['#EF4444', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: 24, height: 24 }}
              />
            </MaskedView>
            <Text style={styles.goalText}>{goal}</Text>
          </View>
        ))}
      </View>

      <LinearGradient
        colors={['#EF4444', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientButton}
      >
        <TouchableOpacity style={styles.button} onPress={handleContinue} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Commit</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

export default Onboarding16;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingTop: 80,
  },
  header: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 24,
  },
  goalList: {
    flex: 1,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  icon: {
    marginRight: 12,
    marginTop: 0,
  },
  goalText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    flexShrink: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 30,
    width: width - 48,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  gradientButton: {
    borderRadius: 30,
    width: width - 48,
    alignSelf: 'center',
  }
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


const { width, height } = Dimensions.get('window');
const scale = width / 375;

const MembershipScreen = () => {
  const navigation = useNavigation<any>();
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  const [isActive, setIsActive] = useState(true);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);

  const [totalPuffs, setTotalPuffs] = useState(0);
  const [moneySaved, setMoneySaved] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      const fetchPuffsAndCalculateSavings = async () => {
        try {
          const keys = await AsyncStorage.getAllKeys();
          const puffKeys = keys.filter(key => key.startsWith('puffTimes-'));

          let puffCount = 0;

          for (const key of puffKeys) {
            const json = await AsyncStorage.getItem(key);
            if (json) {
              try {
                const entries = JSON.parse(json);
                if (Array.isArray(entries)) {
                  puffCount += entries.length;
                }
              } catch {}
            }
          }

          // Assume 500 puffs per vape = $10
          const saved = (puffCount / 500) * 10;

          setTotalPuffs(puffCount);
          setMoneySaved(saved);
        } catch (err) {
          console.error('Failed to calculate savings:', err);
        }
      };

      fetchPuffsAndCalculateSavings();
    }, [])
  );

  useEffect(() => {
    const fetchSubscription = async () => {
      // Replace with your backend call if needed
      const status = await AsyncStorage.getItem('subscriptionStatus');
      const date = await AsyncStorage.getItem('renewalDate');
      setIsActive(status !== 'canceled');
      setRenewalDate(date);
    };
    fetchSubscription();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Membership</Text>

        <View style={styles.option}>
          <Ionicons name="calendar" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.label}>
            {isActive && renewalDate
              ? `Next Renewal: ${renewalDate}`
              : 'Subscription: Canceled'}
          </Text>
        </View>

        <TouchableOpacity style={[styles.option, styles.cancelButton]} onPress={() => setShowCancelPopup(true)}>
          <Ionicons name="close-circle" size={22} color="red" style={styles.icon} />
          <Text style={[styles.label, { color: 'red' }]}>Cancel Membership</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.closeButtonText}>Back to Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Cancel Popup */}
      <Modal transparent visible={showCancelPopup} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCancelPopup(false)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Quitting Already?</Text>
            <Text style={{ color: '#fff', textAlign: 'center', marginVertical: 10 }}>
              You've saved <Text style={{ color: '#00d600' }}>${moneySaved.toFixed(2)}</Text> since you started using this app. Would you like to keep saving even more?
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.confirmButton} onPress={() => setShowCancelPopup(false)}>
                <Text style={styles.confirmText}>Keep Saving</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.giveUpButton}
                onPress={async () => {
                  setShowCancelPopup(false);
                  setIsActive(false);
                  setRenewalDate(null);
                  await AsyncStorage.setItem('subscriptionStatus', 'canceled');
                  await AsyncStorage.removeItem('renewalDate');
                  // Optionally, call your backend to cancel the subscription here
                }}
              >
                <Text style={styles.giveUpText}>Give Up</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderRadius: 12,
    marginBottom: height * 0.015,
  },
  cancelButton: {
    borderColor: 'red',
    borderWidth: 1,
  },
  icon: {
    marginRight: width * 0.04,
  },
  label: {
    fontSize: scale * 16,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#1a1a1a',
    width: width * 0.8,
    padding: width * 0.06,
    borderRadius: 15,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: scale * 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: height * 0.02,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#1e90ff',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  giveUpButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'red',
  },
  giveUpText: {
    color: '#fff',
    fontWeight: 'bold',
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

export default MembershipScreen;
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
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { formatCurrency, formatUSDAsLocalCurrency } from '../services/currency';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases from 'react-native-purchases';


const { width, height } = Dimensions.get('window');
const scale = width / 375;

const MembershipScreen = () => {
  const navigation = useNavigation<any>();
  const [showCancelPopup, setShowCancelPopup] = useState(false);

  const [isActive, setIsActive] = useState(true);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);

  const [totalPuffs, setTotalPuffs] = useState(0);
  const [moneySaved, setMoneySaved] = useState(0);
  const [avgDailyPuffs, setAvgDailyPuffs] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);

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

          setTotalPuffs(puffCount);

          // --- Load avgDailyPuffs and startDate ---
          let avg = 0;
          let start: Date | null = null;
          try {
            const avgStr = await AsyncStorage.getItem('avgDailyPuffs');
            if (avgStr !== null) {
              const parsed = parseFloat(avgStr);
              if (!isNaN(parsed)) avg = parsed;
            }
            if (avg === 0) avg = 600; // Default to 600 if not set
            setAvgDailyPuffs(avg);
          } catch {}
          try {
            const startStr = await AsyncStorage.getItem('startDate');
            if (startStr) {
              start = new Date(startStr);
            }
            setStartDate(start);
          } catch {}

          // --- Calculate money saved (same as StatsScreen) ---
          const today = new Date();
          const daysSinceStart = start
            ? Math.max(Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1, 1)
            : 1;
          let avgForCalc = avg;
          if (avgForCalc === 0) avgForCalc = 600; // Default to 600 if not set
          // Get all puff keys and filter to only include dates since app was loaded
          let relevantPuffCount = 0;
          if (start) {
            const startDateStr = start.toISOString().split('T')[0];
            const todayStr = today.toISOString().split('T')[0];
            const relevantKeys = puffKeys.filter(key => {
              const datePart = key.split('puffTimes-')[1];
              return datePart >= startDateStr && datePart <= todayStr;
            });
            for (const key of relevantKeys) {
              const json = await AsyncStorage.getItem(key);
              if (json) {
                try {
                  const entries = JSON.parse(json);
                  if (Array.isArray(entries)) {
                    relevantPuffCount += entries.length;
                  }
                } catch {}
              }
            }
          } else {
            relevantPuffCount = puffCount;
          }

          const expectedPuffs = avgForCalc * daysSinceStart;
          const originalCost = (expectedPuffs / 500) * 10;
          const adjustedCost = (relevantPuffCount / 500) * 10;
          const saved = originalCost - adjustedCost;
          setMoneySaved(saved);
        } catch (err) {
          console.error('Failed to calculate savings:', err);
        }
      };

      fetchPuffsAndCalculateSavings();
      fetchSubscription(); // Also refresh subscription status when screen is focused
    }, [])
  );

  const fetchSubscription = async () => {
    try {
      // Check RevenueCat customer info for subscription status
      const customerInfo = await Purchases.getCustomerInfo();
      const hasActiveSubscription = customerInfo.entitlements.active['PuffDaddy Pro'] !== undefined;
      
      setIsActive(hasActiveSubscription);
      
      if (hasActiveSubscription) {
        const premiumEntitlement = customerInfo.entitlements.active['PuffDaddy Pro'];
        if (premiumEntitlement && premiumEntitlement.expirationDate) {
          const expirationDate = new Date(premiumEntitlement.expirationDate);
          const renewalDate = expirationDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          console.log('Active subscription found. Next renewal:', renewalDate);
          setRenewalDate(renewalDate);
          await AsyncStorage.setItem('renewalDate', renewalDate);
        } else {
          console.log('Active subscription found but no expiration date');
          setRenewalDate('Active (No renewal date)');
        }
      } else {
        console.log('No active subscription found');
        setRenewalDate(null);
        await AsyncStorage.removeItem('renewalDate');
      }
      
      // Update local storage to match RevenueCat status
      await AsyncStorage.setItem('subscriptionStatus', hasActiveSubscription ? 'active' : 'canceled');
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      // Fallback to local storage
      const status = await AsyncStorage.getItem('subscriptionStatus');
      const date = await AsyncStorage.getItem('renewalDate');
      setIsActive(status !== 'canceled');
      setRenewalDate(date);
    }
  };

  useEffect(() => {
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
              You've saved <Text style={{ color: '#00d600' }}>{formatUSDAsLocalCurrency(moneySaved)}</Text> since you started using this app. Would you like to keep saving even more?
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.confirmButton} onPress={() => setShowCancelPopup(false)}>
                <Text style={styles.confirmText}>Keep Saving</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.giveUpButton}
                onPress={async () => {
                  try {
                    setShowCancelPopup(false);
                    
                    // Check current subscription status from RevenueCat
                    const customerInfo = await Purchases.getCustomerInfo();
                    const activePurchases = customerInfo.activeSubscriptions;
                    
                    if (activePurchases.length > 0) {
                      // For iOS, we need to direct users to Settings to cancel
                      if (Platform.OS === 'ios') {
                        Alert.alert(
                          'Cancel Subscription',
                          'To cancel your subscription, please go to Settings > Apple ID > Subscriptions and cancel from there.',
                          [{ text: 'OK' }]
                        );
                      } else {
                        // For Android, we can attempt to cancel through Google Play
                        Alert.alert(
                          'Cancel Subscription',
                          'To cancel your subscription, please go to Google Play Store > Subscriptions and cancel from there.',
                          [{ text: 'OK' }]
                        );
                      }
                    } else {
                      // No active subscriptions found
                      Alert.alert(
                        'No Active Subscription',
                        'No active subscription was found. Your subscription may have already been canceled.',
                        [{ text: 'OK' }]
                      );
                    }
                  } catch (error) {
                    console.error('Error checking subscription status:', error);
                    Alert.alert(
                      'Error',
                      'There was an error checking your subscription status. Please try again or contact support.',
                      [{ text: 'OK' }]
                    );
                  }
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
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  View,
  Modal,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  BackHandler,
  Alert,
} from 'react-native';
import { TabView } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from './types';

import GoalsScreen from '../screens/GoalsScreen';
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TopBar from '../components/TopBar';
import type { ReactElement } from 'react';
import { Platform } from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases from 'react-native-purchases';

// --- Responsive scale utilities ---
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size; // iPhone X width
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size; // iPhone X height

const initialLayout = { width: SCREEN_WIDTH };

const AppNavigator = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const [index, setIndex] = useState(1);
  const [routes] = useState([
    { key: 'history', title: 'History', icon: 'time-outline', activeIcon: 'time' },
    { key: 'home', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { key: 'goals', title: 'Goals', icon: 'flag-outline', activeIcon: 'flag' },
  ]);
  const [showVapeModal, setShowVapeModal] = useState(false);
  const homeRef = React.useRef<any>(null);
  const goalsRef = React.useRef<any>(null);
  const [goalsResetKey, setGoalsResetKey] = useState(0);
  const [hasPremium, setHasPremium] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Check membership status when screen is focused
  useEffect(() => {
    if (isFocused) {
      // Add longer delay to allow time for restore to complete and cache to update
      setTimeout(() => {
        checkMembershipStatus();
      }, 5000); // Increased from 3000 to 5000
    }
  }, [isFocused]);

  // Prevent back button when user doesn't have premium
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!hasPremium && !isCheckingAccess) {
        // Show alert and prevent back button
        Alert.alert(
          'Premium Required',
          'You need a premium subscription to access this app.',
          [
            { text: 'Get Premium', onPress: () => checkMembershipStatus() },
            { text: 'Exit App', onPress: () => BackHandler.exitApp() }
          ]
        );
        return true; // Prevent default back behavior
      }
      return false; // Allow normal back behavior
    });

    return () => backHandler.remove();
  }, [hasPremium, isCheckingAccess]);

  const checkMembershipStatus = async () => {
    try {
      console.log("=== TAB NAVIGATOR CHECKING MEMBERSHIP ===");
      
      // Force refresh customer info to get latest entitlements after Android's automatic restore
      const customerInfo = await Purchases.getCustomerInfo();
      const hasPremiumAccess = customerInfo.entitlements.active['PuffDaddy Pro'];
      
      console.log("User has PuffDaddy Pro:", hasPremiumAccess);
      console.log("All entitlements:", customerInfo.entitlements.active);
      
      setHasPremium(!!hasPremiumAccess);
      setIsCheckingAccess(false);
      
      if (hasPremiumAccess) {
        console.log("✅ User has valid PuffDaddy Pro membership - no paywall needed");
        // User has premium, no need to show paywall
      } else {
        console.log("❌ User doesn't have PuffDaddy Pro membership - showing paywall");
        // Only show paywall if user doesn't have premium
        const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: "PuffDaddy Pro"
        });

        if (paywallResult === PAYWALL_RESULT.PURCHASED || 
            paywallResult === PAYWALL_RESULT.RESTORED) {
          console.log("User purchased premium membership");
          
          // Manual entitlement refresh after purchase
          setTimeout(async () => {
            try {
              console.log("=== TAB NAVIGATOR: MANUAL REFRESH AFTER PURCHASE ===");
              const refreshedCustomerInfo = await Purchases.getCustomerInfo();
              console.log("Tab Navigator refreshed entitlements:", refreshedCustomerInfo.entitlements.active);
              console.log("Tab Navigator PuffDaddy Pro:", refreshedCustomerInfo.entitlements.active['PuffDaddy Pro']);
              
              // Update premium status
              const newHasPremium = !!refreshedCustomerInfo.entitlements.active['PuffDaddy Pro'];
              setHasPremium(newHasPremium);
              
              if (!newHasPremium) {
                // If still no premium, show paywall again
                Alert.alert(
                  'Purchase Required',
                  'Please complete your purchase to access the app.',
                  [{ text: 'OK', onPress: () => checkMembershipStatus() }]
                );
              }
            } catch (error) {
              console.error("Error in tab navigator refresh:", error);
            }
          }, 2000);
        } else if (paywallResult === PAYWALL_RESULT.CANCELLED) {
          // User cancelled paywall - show it again
          console.log("User cancelled paywall - showing again");
          setTimeout(() => {
            checkMembershipStatus();
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Error checking membership status:", error);
      setIsCheckingAccess(false);
    }
  };

  // Show loading screen while checking access
  if (isCheckingAccess) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.loadingText}>Checking subscription...</Text>
      </View>
    );
  }

  // Show paywall screen if no premium
  if (!hasPremium) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.premiumText}>Premium Subscription Required</Text>
        <TouchableOpacity style={styles.premiumButton} onPress={checkMembershipStatus}>
          <Text style={styles.premiumButtonText}>Get Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderScene = ({ route }: any) => {
    const renderWithTopBar = (
      ContentComponent: ReactElement,
      options: {
        showReset?: boolean;
        onReset?: () => void;
        onVapePress?: () => void;
        isHome?: boolean;
      } = {}
    ) => {
      const { showReset = false, onReset, isHome = false } = options;
      return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <TopBar showReset={showReset} onReset={onReset} onVapePress={options.onVapePress} isHome={isHome} />
          {ContentComponent}
        </View>
      );
    };

    switch (route.key) {
      case 'home':
        return renderWithTopBar(<HomeScreen ref={homeRef} refreshKey={index} />, {
          onVapePress: () => homeRef.current?.openNicotineModal(),
          isHome: true,
        });

      case 'goals':
        return renderWithTopBar(
          <GoalsScreen ref={goalsRef} />,
          {
            showReset: true,
            onReset: () => goalsRef.current?.triggerResetModal?.(),
            isHome: false,
          }
        );

      case 'history':
        return renderWithTopBar(<StatsScreen />, { isHome: false });
      default:
        return null;
    }
  };

  const renderTabBar = () => (
    <SafeAreaView style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {routes.map((route, i) => {
          const focused = index === i;
          const iconName = focused ? route.activeIcon : route.icon;
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={() => setIndex(i)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName as any}
                size={scale(28)}
                color={focused ? '#ffffff' : '#888888'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );

  return (
    <>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
        tabBarPosition="bottom"
      />

      {/* Vape Modal */}
      <Modal
        visible={showVapeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVapeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Vape Detected</Text>
            <Text style={styles.modalText}>
              We detected that you may have taken a vape. Would you like to log this?
            </Text>
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.yesButton]}
                onPress={() => {
                  setShowVapeModal(false);
                  homeRef.current?.logVape();
                }}
              >
                <Text style={styles.yesButtonText}>Yes, Log It</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.noButton]}
                onPress={() => setShowVapeModal(false)}
              >
                <Text style={styles.noButtonText}>No, Skip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabBarContainer: {
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    minWidth: 300,
  },
  modalTitle: {
    fontSize: scale(20),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: scale(16),
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
  },
  yesButton: {
    backgroundColor: '#00d600',
  },
  yesButtonText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noButton: {
    backgroundColor: '#333',
  },
  noButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: scale(18),
  },
  premiumText: {
    color: '#FFF',
    fontSize: scale(24),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  premiumButton: {
    backgroundColor: '#007AFF',
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(30),
    borderRadius: scale(8),
  },
  premiumButtonText: {
    color: '#FFF',
    fontSize: scale(18),
    fontWeight: 'bold',
  },
});

export default AppNavigator;
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";
import Purchases from 'react-native-purchases';
import { RootStackParamList } from '../navigation/types';
import { StackNavigationProp } from '@react-navigation/stack';

const Onboarding17 = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    // Check and present paywall if needed
    const checkPaywall = async () => {
      try {
        console.log("=== ONBOARDING17: CHECKING PAYWALL ===");
        
        // First check if user already has premium (Android might have auto-restored)
        const customerInfo = await Purchases.getCustomerInfo();
        console.log("Customer info:", customerInfo);
        console.log("All entitlements:", customerInfo.entitlements);
        console.log("Active entitlements:", customerInfo.entitlements.active);
        console.log("PuffDaddy Pro entitlement:", customerInfo.entitlements.active['PuffDaddy Pro']);
        console.log("Original app user ID:", customerInfo.originalAppUserId);
        console.log("Current app user ID:", customerInfo.originalAppUserId);
        
        // Commented out for testing restore button
        // if (customerInfo.entitlements.active['PuffDaddy Pro']) {
        //   console.log("✅ User already has PuffDaddy Pro - navigating to MainTabs");
        //   navigation.navigate('MainTabs');
        //   return;
        // } else {
        //   console.log("❌ User does NOT have PuffDaddy Pro - showing paywall");
        // }
        
        console.log("Showing paywall for testing restore button");
        
        // Show paywall if user doesn't have PuffDaddy Pro
        const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: "PuffDaddy Pro"
        });

        console.log("Paywall result:", paywallResult);
        console.log("PAYWALL_RESULT.PURCHASED:", PAYWALL_RESULT.PURCHASED);
        console.log("PAYWALL_RESULT.RESTORED:", PAYWALL_RESULT.RESTORED);

        // Manual entitlement refresh after purchase
        if (paywallResult === PAYWALL_RESULT.PURCHASED || paywallResult === PAYWALL_RESULT.RESTORED) {
          console.log("=== MANUAL ENTITLEMENT REFRESH AFTER PURCHASE ===");
          
          // Force refresh customer info
          const refreshedCustomerInfo = await Purchases.getCustomerInfo();
          console.log("Refreshed customer info:", refreshedCustomerInfo);
          console.log("Refreshed entitlements:", refreshedCustomerInfo.entitlements.active);
          console.log("PuffDaddy Pro after refresh:", refreshedCustomerInfo.entitlements.active['PuffDaddy Pro']);
          
          // Additional delay and refresh for Android
          setTimeout(async () => {
            try {
              console.log("=== ADDITIONAL ANDROID REFRESH ===");
              const finalCustomerInfo = await Purchases.getCustomerInfo();
              console.log("Final customer info:", finalCustomerInfo);
              console.log("Final PuffDaddy Pro:", finalCustomerInfo.entitlements.active['PuffDaddy Pro']);
              
              if (finalCustomerInfo.entitlements.active['PuffDaddy Pro']) {
                console.log("✅ Confirmed PuffDaddy Pro entitlement - navigating to MainTabs");
                navigation.navigate('MainTabs');
              }
            } catch (error) {
              console.error("Error in additional refresh:", error);
            }
          }, 2000);
        }

        // Always check customer info after paywall interaction with delay
        setTimeout(async () => {
          try {
            console.log("=== CHECKING CUSTOMER INFO AFTER PAYWALL (DELAYED) ===");
            const customerInfo = await Purchases.getCustomerInfo();
            console.log("Customer entitlements after paywall:", customerInfo.entitlements.active);
            console.log("PuffDaddy Pro entitlement exists:", !!customerInfo.entitlements.active['PuffDaddy Pro']);
            
            if (customerInfo.entitlements.active['PuffDaddy Pro']) {
              console.log("✅ User has PuffDaddy Pro - navigating to MainTabs");
              console.log("Navigation object:", navigation);
              navigation.navigate('MainTabs');
              console.log("Navigation call completed");
              return;
            } else {
              console.log("❌ User does NOT have premium entitlement");
            }
          } catch (error) {
            console.error("Error checking customer info:", error);
          }
        }, 2000); // 2 second delay

        // Fallback to result-based navigation
        if (paywallResult === PAYWALL_RESULT.PURCHASED) {
          console.log("User purchased PuffDaddy Pro - navigating to onboarding18");
          navigation.navigate('Onboarding18');
        } else if (paywallResult === PAYWALL_RESULT.RESTORED) {
          console.log("User restored purchases - navigating to MainTabs");
          navigation.navigate('MainTabs');
      } else {
          console.log("Other paywall result:", paywallResult);
        }
      } catch (error) {
        console.error("Error presenting paywall:", error);
      }
    };

    checkPaywall();
  }, [navigation]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

export default Onboarding17;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
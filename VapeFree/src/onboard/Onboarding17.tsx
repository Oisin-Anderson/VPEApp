import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { scale, verticalScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCurrency, formatUSDAsLocalCurrency } from '../services/currency';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const { width, height } = Dimensions.get('window');

const Onboarding17 = () => {
  useEffect(() => {
    // Check and present paywall if needed
    const checkPaywall = async () => {
      try {
        const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
          requiredEntitlementIdentifier: "premium" // Changed from "pro" to "premium"
        });

        if (paywallResult === PAYWALL_RESULT.PURCHASED || 
            paywallResult === PAYWALL_RESULT.RESTORED) {
          console.log("User has access to pro features");
          // Handle successful purchase or restore here
        }
      } catch (error) {
        console.error("Error presenting paywall:", error);
      }
    };

    checkPaywall();
  }, []);

  const handleShowPaywall = async () => {
    try {
      // Change the entitlement identifier to use a different paywall
      const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "premium" // Changed from "pro" to "premium"
      });

      if (paywallResult === PAYWALL_RESULT.PURCHASED || 
          paywallResult === PAYWALL_RESULT.RESTORED) {
        console.log("User has access to pro features");
        // Handle successful purchase or restore here
      }
    } catch (error) {
      console.error("Error presenting paywall:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World</Text>
      <TouchableOpacity style={styles.button} onPress={handleShowPaywall}>
        <Text style={styles.buttonText}>Show Paywall</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

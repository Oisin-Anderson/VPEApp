import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesOffering, PurchasesPackage } from 'react-native-purchases';

// Initialize RevenueCat
export const initializeRevenueCat = () => {
  Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

  if (Platform.OS === 'android') {
    Purchases.configure({ apiKey: 'goog_kQVOcjDakWJEEhcswnvEAErObHO' });
  }
};

// Get available offerings
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current || null;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
};

// Purchase a package
export const purchasePackage = async (pkg: PurchasesPackage) => {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, userCancelled: true, customerInfo: undefined };
    }
    throw error;
  }
};

// Check subscription status
export const checkSubscriptionStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] || false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

// Restore purchases
export const restorePurchases = async () => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return { success: true, customerInfo };
  } catch (error) {
    console.error('Error restoring purchases:', error);
    return { success: false, error };
  }
};

export default {
  initializeRevenueCat,
  getOfferings,
  purchasePackage,
  checkSubscriptionStatus,
  restorePurchases,
}; 
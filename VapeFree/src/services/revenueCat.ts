import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesOffering, PurchasesPackage, CustomerInfo } from 'react-native-purchases';

// Initialize RevenueCat
export const initializeRevenueCat = async (userId?: string) => {
  try {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    
    const config = {
      apiKey: 'goog_kQVOcjDakWJEEhcswnvEAErObHO',
      ...(userId && { appUserID: userId })
    };
    
    await Purchases.configure(config);
    console.log('RevenueCat initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
    return false;
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
export const checkSubscriptionStatus = async (entitlementId: string = 'PuffDaddy Pro'): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active[entitlementId];
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};

// Get customer info
export const getCustomerInfo = async (): Promise<CustomerInfo | null> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error getting customer info:', error);
    return null;
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

// Get all entitlements
export const getEntitlements = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements;
  } catch (error) {
    console.error('Error getting entitlements:', error);
    return null;
  }
};

// Check if user has specific entitlement
export const hasEntitlement = async (entitlementId: string): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active[entitlementId];
  } catch (error) {
    console.error('Error checking entitlement:', error);
    return false;
  }
};

// Get active subscriptions
export const getActiveSubscriptions = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.activeSubscriptions;
  } catch (error) {
    console.error('Error getting active subscriptions:', error);
    return [];
  }
};

export default {
  initializeRevenueCat,
  getOfferings,
  purchasePackage,
  checkSubscriptionStatus,
  getCustomerInfo,
  restorePurchases,
  getEntitlements,
  hasEntitlement,
  getActiveSubscriptions,
}; 
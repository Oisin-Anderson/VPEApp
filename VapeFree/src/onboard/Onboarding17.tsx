import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as RNIap from 'react-native-iap';
import { scale, verticalScale } from 'react-native-size-matters';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const productIds = Platform.select({
  //ios: ['com.yourapp.monthly'],
  android: ['com.puffdaddy.monthly', 'com.puffdaddy.yearly'],
}) || [];

const timelineSteps = [
  {
    title: 'Today: Begin Tracking',
    sub: '',
    icon: 'checkmark-sharp',
    active: true,
  },
  {
    title: 'Day 2: Progress Update Notification',
    sub: "",
    icon: 'notifications',
    active: false,
  },
  {
    title: 'Day 3: Trial Ends',
    sub: '',
    icon: 'star',
    active: false,
  },
];

const plans = [
  {
    id: 'yearly',
    title: 'Yearly',
    year: '$29.99',
    perMonth: '$2.49',
    badge: 'Most Popular - Save 50%',
    trial: 'Try Free for 3 days',
    productId: 'com.puffdaddy.yearly',
  },
  {
    id: 'monthly',
    title: 'Monthly',
    year: '$59.99',
    perMonth: '$4.99',
    badge: '',
    trial: '',
    productId: 'com.puffdaddy.monthly',
  },
];

const Onboarding17 = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('yearly');

  useEffect(() => {
    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        const fetched = await RNIap.getSubscriptions({ skus: productIds });
        setProducts(fetched);
      } catch (err) {
        console.warn('IAP Error', err);
      }
    };
    initIAP();
    return () => {
      RNIap.endConnection();
    };
  }, []);

  const getProduct = (id: string) => products.find(p => p.productId === plans.find(pl => pl.id === id)?.productId);

  const handleSubscribe = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    const product = getProduct(selectedPlan);
    if (!product) return;
    setLoading(true);
    try {
      await RNIap.requestSubscription(product.productId);
      Alert.alert('Success', 'Subscription started!');
      const now = new Date();
      let nextRenewal;
      if (selectedPlan === 'yearly') {
        nextRenewal = new Date();
        nextRenewal.setFullYear(now.getFullYear() + 1);
      } else {
        nextRenewal = new Date();
        nextRenewal.setMonth(now.getMonth() + 1);
      }
      await AsyncStorage.setItem('renewalDate', nextRenewal.toDateString());
      await AsyncStorage.setItem('subscriptionStatus', 'active');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  // For the blue line: calculate its height so it ends at the center of the last circle
  const timelineHeight = verticalScale(32) * (timelineSteps.length - 1) + scale(36) / 2;

  
  return (
    <View style={styles.root}>
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={{ flex: 1 }}
        >
          <Text style={styles.title}>How your free trial works</Text>
          <View style={styles.timelineContainer}>
            {/* Vertical blue line */}
            <View
              style={[
                styles.verticalLine,
                {
                  height: (timelineSteps.length - 1) * verticalScale(64) + scale(36), // 64 is row gap, 36 is bullet size
                  top: 0,
                  left: scale(8) + scale(18) - scale(1), // 8 is paddingLeft, 18 is half bullet, 1 is half line width
                },
              ]}
            />
            {timelineSteps.map((step, i) => (
              <View key={i} style={styles.timelineRow}>
                <View
                  style={[
                    styles.bullet,
                    i === 0 ? styles.bulletFirst : styles.bulletRest
                  ]}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={scale(20)}
                    color={i === 0 ? '#2563eb' : '#444'}
                  />
                </View>
                <View style={styles.timelineTextContainer}>
                  <Text style={styles.timelineTitle}>{step.title}</Text>
                  <Text style={styles.timelineSub}>{step.sub}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <View style={styles.bottomPanel}>
        <Text style={styles.planTitle}>Choose Your Plan</Text>
        <View style={styles.planRow}>
          {plans.map((plan, idx) => {
            const product = getProduct(plan.id);
            const isSelected = selectedPlan === plan.id;
            if (plan.id === 'yearly') {
              // Yearly plan: keep as is
              return (
                <View key={plan.id} style={{ width: '100%', marginBottom: verticalScale(10) }}>
                  {isSelected ? (
                    <LinearGradient
                      colors={['#EF4444', '#3B82F6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.planOptionGradient}
                    >
                      <TouchableOpacity
                        style={[
                          styles.planOption,
                          { backgroundColor: '#fff', borderColor: 'transparent', width: '100%', alignSelf: 'center', marginBottom: 0 }
                        ]}
                        onPress={() => setSelectedPlan(plan.id)}
                        activeOpacity={0.9}
                      >
                        {plan.badge ? (
                          <LinearGradient
                            colors={['#EF4444', '#3B82F6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.badge}
                          >
                            <Text style={[styles.badgeText, { color: '#000' }]}>{plan.badge}</Text>
                          </LinearGradient>
                        ) : null}
                        <View style={styles.planPriceRow}>
                          <Text style={[styles.planPrice, isSelected && { color: '#000' }]}>{plan.year}</Text>
                          <Text style={[styles.planPerMonth, isSelected && { color: '#000' }]}>{plan.perMonth}/mo</Text>
                        </View>
                        <Text style={[styles.planOptionTitle, isSelected && { color: '#000' }]}>{plan.title}</Text>
                        {plan.trial ? (
                          <Text style={[styles.planTrial, isSelected && { color: '#000' }]}>{plan.trial}</Text>
                        ) : null}
                      </TouchableOpacity>
                    </LinearGradient>
                  ) : (
                    <TouchableOpacity
                      style={[styles.planOption, isSelected && styles.planOptionActive]}
                      onPress={() => setSelectedPlan(plan.id)}
                      activeOpacity={0.9}
                    >
                      {plan.badge ? (
                        <LinearGradient
                          colors={['#EF4444', '#3B82F6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.badge}
                        >
                          <Text style={[styles.badgeText, { color: '#000' }]}>{plan.badge}</Text>
                        </LinearGradient>
                      ) : null}
                      <View style={styles.planPriceRow}>
                        <Text style={[styles.planPrice, isSelected && { color: '#000' }]}>{plan.year}</Text>
                        <Text style={[styles.planPerMonth, isSelected && { color: '#000' }]}>{plan.perMonth}/mo</Text>
                      </View>
                      <Text style={[styles.planOptionTitle, isSelected && { color: '#000' }]}>{plan.title}</Text>
                      {plan.trial ? (
                        <Text style={[styles.planTrial, isSelected && { color: '#000' }]}>{plan.trial}</Text>
                      ) : null}
                    </TouchableOpacity>
                  )}
                </View>
              );
            } else {
              // Monthly plan: just plan name left, price right
              return (
                <View key={plan.id} style={{ width: '100%', marginBottom: verticalScale(10) }}>
                  <TouchableOpacity
                    style={[styles.planOption, isSelected && styles.planOptionActive, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                    onPress={() => setSelectedPlan(plan.id)}
                    activeOpacity={0.9}
                  >
                    <Text style={[styles.planOptionTitle, isSelected && { color: '#000', fontWeight: '700' }]}>{plan.title}</Text>
                    <Text style={[styles.planPerMonth, isSelected && { color: '#000', fontWeight: '700' }]}>{plan.perMonth}/mo</Text>
                  </TouchableOpacity>
                </View>
              );
            }
          })}
        </View>
        <View style={{ width: '100%', alignSelf: 'center'}}>
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.5 }, { overflow: 'hidden', backgroundColor: 'transparent' }]}
            onPress={handleSubscribe}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#EF4444', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
            <Text style={styles.buttonText}>Start Your Free Trial</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.buttonSub}>No payment due now!</Text>
      </View>
    </View>
  );
};

export default Onboarding17;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(32),
    paddingBottom: verticalScale(240), // enough to show last step above bottom panel
  },
  title: {
    color: '#fff',
    fontSize: scale(24),
    fontWeight: '700',
    marginBottom: verticalScale(32),
    textAlign: 'center',
    lineHeight: scale(30),
  },
  timelineContainer: {
    marginBottom: verticalScale(24),
    paddingLeft: scale(8),
    position: 'relative',
    minHeight: timelineSteps.length * verticalScale(64), // enough for all steps
    flexGrow: 1,
  },
  verticalLine: {
    position: 'absolute',
    left: scale(24),
    width: scale(2),
    backgroundColor: '#2563eb',
    zIndex: 0,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: verticalScale(64), // fixed height for each row
    zIndex: 2,
  },
  bullet: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
    zIndex: 3,
    borderWidth: scale(2),
    borderColor: '#2563eb',
  },
  bulletFirst: {
    backgroundColor: '#fff',
  },
  bulletRest: {
    backgroundColor: '#222',
  },
  timelineTextContainer: {
    flex: 1,
    paddingTop: verticalScale(2),
  },
  timelineTitle: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: '700',
    marginBottom: verticalScale(2),
  },
  timelineSub: {
    color: '#aaa',
    fontSize: scale(13),
    fontWeight: '400',
    marginBottom: verticalScale(2),
  },
  bottomPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#18181b',
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(24),
    paddingHorizontal: scale(18),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  planTitle: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: '700',
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  planRow: {
    width: '100%',
    marginBottom: verticalScale(12),
  },
  planOptionGradient: {
    borderRadius: scale(12),
    padding: scale(2),
    width: '100%',
  },
  planOption: {
    borderRadius: scale(12),
    padding: scale(16),
    width: '100%',
    backgroundColor: '#232326',
    alignItems: 'flex-start',
    borderWidth: 0,
    marginBottom: 0,
  },
  planOptionActive: {
    backgroundColor: '#fff',
    borderColor: '#2563eb',
    marginBottom: 0,
    borderRadius: scale(12),
    padding: scale(16),
    width: '100%',
    alignItems: 'flex-start',
  },
  planPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: scale(2),
  },
  planPrice: {
    color: '#fff',
    fontSize: scale(16),
    fontWeight: '700',
  },
  planPerMonth: {
    color: '#fff',
    fontSize: scale(13),
    fontWeight: '700',
  },
  planOptionTitle: {
    color: '#fff',
    fontSize: scale(13),
    fontWeight: '700',
    marginBottom: scale(2),
    marginTop: scale(2),
  },
  planTrial: {
    color: '#fff',
    fontSize: scale(10),
    marginTop: verticalScale(2),
  },
  badge: {
    borderRadius: scale(8),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: scale(12),
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: verticalScale(18),
    borderRadius: scale(30),
    width: '100%',
    alignSelf: 'center',
    marginTop: verticalScale(6),
    marginBottom: verticalScale(6),
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: scale(18),
    textAlign: 'center',
  },
  buttonSub: {
    color: '#aaa',
    fontSize: scale(13),
    textAlign: 'center',
    marginBottom: Platform.OS === 'android' ? 30 : 0,
  },
});
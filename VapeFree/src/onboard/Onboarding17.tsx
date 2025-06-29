import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as RNIap from 'react-native-iap';

const productIds = Platform.select({
  ios: ['com.yourapp.monthly'],       // Replace with real iOS product ID
  android: ['com.yourapp.monthly'],   // Replace with real Android product ID
}) || [];

const Onboarding17 = () => {
  const navigation = useNavigation<any>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initIAP = async () => {
      try {
        await RNIap.initConnection();
        const products = await RNIap.getSubscriptions({ skus: productIds });
        setProduct(products[0]);
      } catch (err) {
        console.warn('IAP Error', err);
      }
    };
    initIAP();
    return () => {
      RNIap.endConnection();
    };
  }, []);

  const handleSubscribe = async () => {
    if (!product) return;
    setLoading(true);
    try {
      await RNIap.requestSubscription(product.productId);
      Alert.alert('Success', 'Subscription started!');
      // Optionally: navigate or update state
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Start your Free Week and gain 2+ hours back</Text>

      <View style={styles.timeline}>
        {[
          'Get your Focus Diagnosis',
          'Today: Improve Your Focus',
          'Day 4: See first results',
          'Day 7: Trial Ends',
        ].map((step, i) => (
          <View style={styles.timelineItem} key={i}>
            <View style={[styles.bullet, i === 0 && styles.bulletActive]} />
            <Text style={[styles.stepText, i === 1 && styles.stepHighlight]}>
              {step}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.disclaimer}>
        Your subscription will start on day 7. Cancel anytime within 1 week.
      </Text>

      <Text style={styles.priceText}>
        Try Free for 1 week{'\n'}
        Then {product?.localizedPrice || '$5.99/month'}
      </Text>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.5 }]}
        onPress={handleSubscribe}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Start Your Free Week</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboarding17;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  timeline: {
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bullet: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#888',
    marginRight: 12,
  },
  bulletActive: {
    backgroundColor: '#3B82F6',
  },
  stepText: {
    color: '#ccc',
    fontSize: 16,
  },
  stepHighlight: {
    color: '#fff',
    fontWeight: '600',
  },
  disclaimer: {
    color: '#888',
    fontSize: 13,
    textAlign: 'left',
    marginBottom: 10,
  },
  priceText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 30,
    width: width - 48,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});
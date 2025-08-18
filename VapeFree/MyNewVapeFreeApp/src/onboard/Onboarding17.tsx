import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

const Onboarding17 = () => {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.root}>
      <RevenueCatUI.Paywall
        onPurchaseCompleted={() => {
          navigation.navigate('Onboarding18');
        }}
        onDismiss={() => {
          // Optionally handle paywall dismissed
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default Onboarding17;
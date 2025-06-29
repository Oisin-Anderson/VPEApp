// src/components/ProgressBar.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface Props {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: Props) => {
  const segmentWidth = (width - 48) / totalSteps - 4;

  return (
    <View style={styles.container}>
      {[...Array(totalSteps)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            {
              width: segmentWidth,
              opacity: i < currentStep ? 1 : 0.2,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 24,
    gap: 4,
  },
  segment: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
});

export default ProgressBar;
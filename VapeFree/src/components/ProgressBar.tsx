// src/components/ProgressBar.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size; // 375 is base width (iPhone X)
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size; // 812 is base height


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
    marginBottom: verticalScale(10),
    gap: scale(4),                 // consistent segment gap
  },
  segment: {
    height: verticalScale(4),
    borderRadius: scale(2),
    backgroundColor: '#ffffff',
  },
});

export default ProgressBar;
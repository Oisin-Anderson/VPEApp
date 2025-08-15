import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const Progress = ({ onComplete }: { onComplete: () => void }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [text, setText] = useState('Calculating');
  const navigation = useNavigation<any>();

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      onComplete();
    });

    const textTimeout = setTimeout(() => setText('Preparing report…'), 2500);
    return () => clearTimeout(textTimeout);
  }, []);

  const containerWidth = Dimensions.get('window').width - 80;
  const animatedWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, containerWidth],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{text}</Text>
      <View style={[styles.track, { width: containerWidth }]}>
        <Animated.View style={{ width: animatedWidth, height: '100%' }}>
          <LinearGradient
            colors={['#EF4444', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bar}
          />
        </Animated.View>
      </View>
    </View>
  );
};

export default Progress;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  track: {
    height: 12,
    backgroundColor: '#1e1e1e',
    borderRadius: 6,
    overflow: 'hidden',
  },
  bar: {
    flex: 1,
    borderRadius: 6,
  },
});
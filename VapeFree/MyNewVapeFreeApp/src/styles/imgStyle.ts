// src/styles/onboarding1Styles.ts
import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;

export const imgStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: verticalScale(60),
  },
  videoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(450),
  },
  video: {
    width: SCREEN_WIDTH * 0.85,
    height: '100%',
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: scale(30),
  },
  title: {
    fontSize: scale(28),
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  subtitle: {
    color: '#ccc',
    fontSize: scale(16),
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  subtitleHeader: {
    color: '#888',
    fontSize: scale(16),
    textAlign: 'center',
    marginBottom: scale(8),
  },
  boldText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonWrapper: {
    marginTop: 'auto',
    paddingHorizontal: scale(30),
    width: '100%',
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: scale(30),
    paddingVertical: 15,
    paddingHorizontal: scale(40),
    marginBottom: Platform.OS === 'android' ? 60 : 30,
    width: '100%',
  },
  buttonText: {
    color: '#000',
    fontSize: scale(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  linkText: {
    color: '#ccc',
    fontSize: scale(15),
    textAlign: 'center',
  },
});
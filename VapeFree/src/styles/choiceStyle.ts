// src/styles/sharedStyles.ts
import { Dimensions, StyleSheet, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
export const scale = (size: number) => (SCREEN_WIDTH / 375) * size;
export const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size;

// Shared base styles
export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: verticalScale(60),
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: scale(30),
  },
  header: {
    color: '#ffffff',
    fontSize: scale(26),
    fontWeight: 'bold',
    lineHeight: scale(34),
    marginTop: 10,
    textAlign: 'center',
  },
  subtext: {
    color: '#aaaaaa',
    fontSize: scale(14),
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionContainer: {
    width: '100%',
    marginTop: 10,
    gap: 10,
  },
  option: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionSelected: {
    backgroundColor: '#ffffff',
  },
  optionText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  buttonWrapper: {
    marginTop: 'auto',
    paddingHorizontal: scale(30),
    width: '100%',
  },
  continueButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    borderRadius: scale(30),
    width: '100%',
    marginBottom: Platform.OS === 'android' ? 60 : 30,
  },
  continueText: {
    color: '#000',
    fontSize: scale(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
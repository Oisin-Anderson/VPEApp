import React, { useState } from 'react';
import {
  Dimensions,
  View,
  Modal,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { TabView } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';

import GoalsScreen from '../screens/GoalsScreen';
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TopBar from '../components/TopBar';
import type { ReactElement } from 'react';
import { Platform } from 'react-native';

// --- Responsive scale utilities ---
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const scale = (size: number) => (SCREEN_WIDTH / 375) * size; // iPhone X width
const verticalScale = (size: number) => (SCREEN_HEIGHT / 812) * size; // iPhone X height

const initialLayout = { width: SCREEN_WIDTH };

const AppNavigator = () => {
  const [index, setIndex] = useState(1);
  const [routes] = useState([
    { key: 'history', title: 'History', icon: 'time-outline', activeIcon: 'time' },
    { key: 'home', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { key: 'goals', title: 'Goals', icon: 'flag-outline', activeIcon: 'flag' },
  ]);
  const [showVapeModal, setShowVapeModal] = useState(false);
  const homeRef = React.useRef<any>(null);
  const goalsRef = React.useRef<any>(null);
  const [goalsResetKey, setGoalsResetKey] = useState(0);

  const renderScene = ({ route }: any) => {
    const renderWithTopBar = (
      ContentComponent: ReactElement,
      options: {
        showReset?: boolean;
        onReset?: () => void;
        onVapePress?: () => void;
        isHome?: boolean;
      } = {}
    ) => {
      const { showReset = false, onReset, isHome = false } = options;
      return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <TopBar showReset={showReset} onReset={onReset} onVapePress={options.onVapePress} isHome={isHome} />
          {ContentComponent}
        </View>
      );
    };

    switch (route.key) {
      case 'home':
        return renderWithTopBar(<HomeScreen ref={homeRef} refreshKey={index} />, {
          onVapePress: () => homeRef.current?.openNicotineModal(),
          isHome: true,
        });

      case 'goals':
        return renderWithTopBar(
          <GoalsScreen ref={goalsRef} />,
          {
            showReset: true,
            onReset: () => goalsRef.current?.hardReset?.(),
            isHome: false,
          }
        );

      case 'history':
        return renderWithTopBar(<StatsScreen />, { isHome: false });
      default:
        return null;
    }
  };

  const renderTabBar = () => (
    <SafeAreaView style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {routes.map((route, i) => {
          const focused = index === i;
          const iconName = focused ? route.activeIcon : route.icon;
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={() => setIndex(i)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={iconName as any}
                size={scale(28)}
                color={focused ? '#ffffff' : '#888888'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );

  return (
    <>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={renderTabBar}
        tabBarPosition="bottom"
      />

      {showVapeModal && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setShowVapeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Strength</Text>
              <Text style={styles.modalDescription}>
                (Implement strength input here or connect to HomeScreen modal.)
              </Text>
              <TouchableOpacity onPress={() => setShowVapeModal(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#000',
    paddingBottom: Platform.OS === 'android' ? verticalScale(40) : 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(20),
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: scale(20),
    borderRadius: scale(10),
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: scale(18),
    marginBottom: verticalScale(10),
  },
  modalDescription: {
    color: '#555',
    textAlign: 'center',
    marginBottom: verticalScale(20),
  },
  modalCloseText: {
    color: '#007AFF',
    fontSize: scale(14),
  },
});

export default AppNavigator;
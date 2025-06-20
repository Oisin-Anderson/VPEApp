import React, { useState } from 'react';
import { Dimensions, View } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';

import GoalsScreen from '../screens/GoalsScreen';
import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const initialLayout = { width: Dimensions.get('window').width };

const AppNavigator = () => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'home', title: 'Home', icon: 'home-outline', activeIcon: 'home' },
    { key: 'goals', title: 'Goals', icon: 'flag-outline', activeIcon: 'flag' },
    { key: 'history', title: 'History', icon: 'time-outline', activeIcon: 'time' },
    { key: 'settings', title: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
  ]);

  const renderScene = SceneMap({
    home: HomeScreen,
    goals: GoalsScreen,
    history: StatsScreen,
    settings: SettingsScreen,
  });

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
            >
              <Ionicons
                name={iconName as any}
                size={26}
                color={focused ? '#ffffff' : '#888888'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={initialLayout}
      renderTabBar={renderTabBar}
      tabBarPosition="bottom" // not strictly necessary due to custom position
    />
  );
};

  const styles = StyleSheet.create({
    tabBarContainer: {
      backgroundColor: '#212124',
    },
    tabBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 10,
      paddingBottom: 60, // ⬅️ Padding to lift above system buttons
    },
    tabItem: {
      alignItems: 'center',
    },
  });


export default AppNavigator;
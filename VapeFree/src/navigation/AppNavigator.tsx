import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen'; // Adjust the path based on your folder structure
import HistoryScreen from '../screens/HistoryScreen'; // Placeholder
import GoalsScreen from '../screens/GoalsScreen'; // Placeholder
import SettingsScreen from '../screens/SettingsScreen'; // Placeholder

const Tab = createBottomTabNavigator();

// Explicitly type the icon names to match Ionicons' available icons
type IconName = 'home' | 'home-outline' | 'time' | 'time-outline' | 'flag' | 'flag-outline' | 'settings' | 'settings-outline';

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName = 'home'; // Default value

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Goals') {
            iconName = focused ? 'flag' : 'flag-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            console.warn(`Unknown route name: ${route.name}, using default icon 'home'`);
            iconName = 'home'; // Fallback for unexpected routes
          }

          // Type assertion to ensure compatibility with Ionicons' name prop
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#888',
        headerShown: false, // Disable the header for all screens
      })}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
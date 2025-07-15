// src/navigation/AppNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack';
import LoadingScreen from '../screens/LoadingScreen';
import OnboardingScreen from '../onboard/Onboarding1';
import Onboarding2 from '../onboard/Onboarding2';
import Onboarding3 from '../onboard/Onboarding3';
import Onboarding4 from '../onboard/Onboarding4';
import Onboarding5 from '../onboard/Onboarding5';
import Onboarding6 from '../onboard/Onboarding6';
import Onboarding7 from '../onboard/Onboarding7';
import Onboarding8 from '../onboard/Onboarding8';
import Onboarding9 from '../onboard/Onboarding9';
import Onboarding10 from '../onboard/Onboarding10';
import Onboarding11 from '../onboard/Onboarding11';
import Onboarding12 from '../onboard/Onboarding12';
import Onboarding13 from '../onboard/Onboarding13';
import Onboarding14 from '../onboard/Onboarding14';
import Onboarding15 from '../onboard/Onboarding15';
import Onboarding16 from '../onboard/Onboarding16';
import Onboarding17 from '../onboard/Onboarding17';
import Onboarding18 from '../onboard/Onboarding18';
import Onboarding19 from '../onboard/Onboarding19';
import Onboarding20 from '../onboard/Onboarding20';
import Onboarding21 from '../onboard/Onboarding21';
import Onboarding22 from '../onboard/Onboarding22';
import Onboarding23 from '../onboard/Onboarding23';
import TabNavigatorComponent from '../navigation/TabNavigatorComponent';
import SettingsScreen from '../screens/SettingsScreen';
import MembershipScreen from '../screens/MembershipScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
// MainTabs is your current TabView screen

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LoadingScreen">
      <Stack.Screen name="LoadingScreen" component={LoadingScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigatorComponent} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />
      <Stack.Screen name="Onboarding4" component={Onboarding4} />
      <Stack.Screen name="Onboarding5" component={Onboarding5} />
      <Stack.Screen name="Onboarding6" component={Onboarding6} />
      <Stack.Screen name="Onboarding7" component={Onboarding7} />
      <Stack.Screen name="Onboarding8" component={Onboarding8} />
      <Stack.Screen name="Onboarding9" component={Onboarding9} />
      <Stack.Screen name="Onboarding10" component={Onboarding10} />
      <Stack.Screen name="Onboarding11" component={Onboarding11} />
      <Stack.Screen name="Onboarding12" component={Onboarding12} />
      <Stack.Screen name="Onboarding13" component={Onboarding13} />
      <Stack.Screen name="Onboarding14" component={Onboarding14} />
      <Stack.Screen name="Onboarding15" component={Onboarding15} />
      <Stack.Screen name="Onboarding16" component={Onboarding16} />
      <Stack.Screen name="Onboarding17" component={Onboarding17} />
      <Stack.Screen name="Onboarding18" component={Onboarding18} />
      <Stack.Screen name="Onboarding19" component={Onboarding19} />
      <Stack.Screen name="Onboarding20" component={Onboarding20} />
      <Stack.Screen name="Onboarding21" component={Onboarding21} />
      <Stack.Screen name="Onboarding22" component={Onboarding22} />
      <Stack.Screen name="Onboarding23" component={Onboarding23} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
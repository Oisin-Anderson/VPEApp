import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Share,
  Modal,
  Pressable,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as MailComposer from 'expo-mail-composer';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Platform } from 'react-native';


const { width, height } = Dimensions.get('window');

// Scale factors
const isSmallDevice = width < 360;
const scale = width / 375; // 375 is a common baseline




const SettingsScreen = () => {
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const navigation = useNavigation<any>();

  const emailHelp = async (subject: string) => {
    const isAvailable = await MailComposer.isAvailableAsync();

    if (isAvailable) {
      MailComposer.composeAsync({
        recipients: ['oisin@oagames.xyz'],
        subject: subject,
        body: '',
      });
    } else {
      // Fallback: open default mail app with mailto link
      const mailto = `mailto:oisin@oagames.xyz?subject=${encodeURIComponent(subject)}`;
      try {
        Linking.openURL(mailto);
      } catch (e) {
        Alert.alert(
          'Mail App Not Available',
          'Email is not set up on this device. Please configure your mail app first.'
        );
      }
    }
  };

  const emailFeedback = async (subject: string) => {
    const isAvailable = await MailComposer.isAvailableAsync();

    if (isAvailable) {
      MailComposer.composeAsync({
        recipients: ['oisin@oagames.xyz'],
        subject: subject,
        body: '',
      });
    } else {
      // Fallback: open default mail app with mailto link
      const mailto = `mailto:oisin@oagames.xyz?subject=${encodeURIComponent(subject)}`;
      try {
        Linking.openURL(mailto);
      } catch (e) {
        Alert.alert(
          'Mail App Not Available',
          'Email is not set up on this device. Please configure your mail app first.'
        );
      }
    }
  };


  const handleRateUs = () => {
    setShowRatingPopup(true);
  };

  const handleStarPress = (rating: number) => {
    setSelectedRating(rating);
    setShowRatingPopup(false);

    if (rating < 4) {
      Alert.alert('Thanks for your feedback!');
    } else {
      Linking.openURL('https://example.com/store');
    }
  };

  const shareApp = async () => {
    const iosLink = 'https://apps.apple.com/app/idYOUR_APP_ID';
    const androidLink = 'https://play.google.com/store/apps/details?id=YOUR_PACKAGE_NAME';

    const url = Platform.OS === 'ios' ? iosLink : androidLink;

    await Share.share({
      message: `Check out this awesome app: ${url}`,
    });
  };

  const openWebPage = (url: string) => {
    Linking.openURL(url);
  };

  const settingsOptions = [
    { label: 'Need Help', icon: 'mail', onPress: () => emailHelp('PuffDaddy Help') },
    //{ label: 'Rate Us', icon: 'star', onPress: handleRateUs },
    { label: 'Give Feedback', icon: 'chatbox-ellipses', onPress: () => emailFeedback('PuffDaddy Feedback') },
    //{ label: 'Share the App', icon: 'share-social', onPress: shareApp },
    { label: 'Notifications', icon: 'notifications', onPress: () => navigation.navigate('Notifications') },
    { label: 'Future Updates', icon: 'rocket', onPress: () => navigation.navigate('FutureUpdates') },
    { label: 'Privacy Policy', icon: 'lock-closed', onPress: () => openWebPage('https://oagames.xyz/privacypolicy.html') },
    { label: 'Terms of Use', icon: 'document-text', onPress: () => openWebPage('https://oagames.xyz/terms.html') },
    { label: 'Membership', icon: 'card', onPress: () => navigation.navigate('Membership') },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Settings</Text>
        {settingsOptions.map((item, index) => (
          <TouchableOpacity key={index} style={styles.option} onPress={item.onPress}>
            <Ionicons name={item.icon as any} size={22} color="#fff" style={styles.icon} />
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={styles.closeButtonText}>Close Settings</Text>
        </TouchableOpacity>
      </View>


      {/* Rating Popup */}
      <Modal transparent visible={showRatingPopup} animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowRatingPopup(false)}>
          <Pressable style={styles.popup} onPress={() => {}}>
            <Text style={styles.popupTitle}>Rate the App</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((num) => (
                <Pressable key={num} onPress={() => handleStarPress(num)}>
                  <Ionicons
                    name={num <= selectedRating ? 'star' : 'star-outline'}
                    size={32}
                    color="#f1c40f"
                    style={styles.star}
                  />
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: height * 0.06, // roughly 6% of screen height
    paddingHorizontal: width * 0.06, // ~24px on 375px width
  },
  scrollContent: {
    paddingBottom: height * 0.05,
  },
  header: {
    fontSize: scale * 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: height * 0.035,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
    borderRadius: 12,
    marginBottom: height * 0.015,
  },
  icon: {
    marginRight: width * 0.04,
  },
  label: {
    fontSize: scale * 16,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#1a1a1a',
    width: width * 0.8,
    padding: width * 0.06,
    borderRadius: 15,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: scale * 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: height * 0.02,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    marginHorizontal: width * 0.015,
  },
  buttonWrapper: {
    paddingBottom: height * 0.04,
    paddingHorizontal: width * 0.06,
    alignItems: 'center',
    marginBottom: height * 0.05,
  },
  closeButton: {
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.2,
    width: '100%',
  },
  closeButtonText: {
    color: '#000',
    fontSize: scale * 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

});

export default SettingsScreen;
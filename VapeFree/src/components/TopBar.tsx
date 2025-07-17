// components/TopBar.tsx
import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Dimensions } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePuff } from '../context/PuffContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Modal, Pressable, TextInput } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types'; // adjust path if needed

// Responsive scaling functions
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = (size: number) => (SCREEN_WIDTH / 375) * size;


const TopBar = ({
  showReset = false,
  onReset,
  onVapePress,
  isHome = false,
}: {
  showReset?: boolean;
  onReset?: () => void;
  onVapePress?: () => void;
  isHome?: boolean;
}) => {

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { puffCount, setPuffCount, nicotineMg, setNicotineMg } = usePuff();
  const [showEditCountModal, setShowEditCountModal] = useState(false);
  const [editCountValue, setEditCountValue] = useState('');


  const handleEditCountSave = async () => {
    const val = parseInt(editCountValue, 10);
    if (!isNaN(val) && val >= 0) {
      // Get today's date key
      const today = new Date().toISOString().split('T')[0];
      try {
        // Get nicotine strength
        let nicotineStrength = '0';
        try {
          const savedStrength = await AsyncStorage.getItem('nicotineStrength');
          if (savedStrength !== null) nicotineStrength = savedStrength;
        } catch {}
        const strength = parseFloat(nicotineStrength) || 0;
        const nicotinePerPuff = 0.005 * strength;

        // Get current puff count and nicotineMg
        let puffTimes: any[] = [];
        let currentNicotineMg = 0;
        try {
          const savedPuffTimes = await AsyncStorage.getItem(`puffTimes-${today}`);
          puffTimes = savedPuffTimes ? JSON.parse(savedPuffTimes) : [];
          const savedNicotineMg = await AsyncStorage.getItem(`nicotineMg-${today}`);
          currentNicotineMg = savedNicotineMg ? parseFloat(savedNicotineMg) : 0;
        } catch {}
        const oldCount = puffTimes.length;
        const diff = val - oldCount;
        let newNicotineMg = currentNicotineMg;
        if (diff > 0) {
          newNicotineMg += diff * nicotinePerPuff;
        } else if (diff < 0) {
          newNicotineMg = Math.max(0, currentNicotineMg + diff * nicotinePerPuff); // diff is negative
        }
        // Update puffTimes array
        if (val > oldCount) {
          for (let i = oldCount; i < val; i++) {
            puffTimes.push({ time: new Date().toISOString(), strength });
          }
        } else if (val < oldCount) {
          puffTimes = puffTimes.slice(0, val);
        }
        // Save updates
        await AsyncStorage.setItem(`puffTimes-${today}`, JSON.stringify(puffTimes));
        await AsyncStorage.setItem(`nicotineMg-${today}`, newNicotineMg.toString());
        setPuffCount(val);
        setNicotineMg(newNicotineMg); // <-- update context for real-time UI
        setShowEditCountModal(false);
        // Optionally: trigger a refresh in HomeScreen if needed
      } catch (err) {
        // ignore errors for now
      }
    } else {
      Alert.alert('Invalid input', 'Please enter a valid number that is 0 or more.');
    }
  };


  return (
    <View style={styles.titleContainer}>
      <View style={styles.titleRow}>
        <MaskedView maskElement={<Text style={styles.appTitle}>PuffDaddy</Text>}>
          <LinearGradient colors={['#EF4444', '#3B82F6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={[styles.appTitle, { opacity: 0 }]}>PuffDaddy</Text>
          </LinearGradient>
        </MaskedView>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          {showReset && (
            <TouchableOpacity onPress={onReset}>
              <Ionicons name="refresh" size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
          {/* Plus button for editing puff count, only on HomeScreen, to the left of cloud icon */}
          {isHome && (
            <TouchableOpacity onPress={() => {
              setEditCountValue(puffCount.toString());
              setShowEditCountModal(true);
            }}>
              <Ionicons name="add" size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
          {onVapePress && (
            <TouchableOpacity onPress={onVapePress}>
              <Ionicons name="cloud-outline" size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>



      
      {/* Edit Puff Count Modal */}
      <Modal
        transparent={true}
        visible={showEditCountModal}
        animationType="fade"
        onRequestClose={() => setShowEditCountModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#1e1e1e', paddingVertical: 30, paddingHorizontal: 30, borderRadius: 20, width: '90%', alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 15, textAlign: 'center' }}>Edit Your Count</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, width: '80%' }}>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#fff', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 15, flex: 1, textAlign: 'center', fontSize: 16, backgroundColor: '#1a1a1a', color: '#fff' }}
                keyboardType="numeric"
                value={editCountValue}
                onChangeText={setEditCountValue}
                placeholder="0"
              />
            </View>
            <Pressable
              style={{ backgroundColor: '#fff', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, marginTop: 10, width: '100%' }}
              onPress={handleEditCountSave}
            >
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000', textAlign: 'center' }}>Save</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    paddingTop: 30,
    paddingBottom: 10,
    backgroundColor: '#000',
    paddingHorizontal: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default TopBar;
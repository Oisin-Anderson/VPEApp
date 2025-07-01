// components/TopBar.tsx
import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Modal, Pressable } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types'; // adjust path if needed


const TopBar = ({
  showReset = false,
  onReset,
  onVapePress,
}: {
  showReset?: boolean;
  onReset?: () => void;
  onVapePress?: () => void;
}) => {

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [showResetModal, setShowResetModal] = useState(false);


  const handleReset = () => {
    setShowResetModal(true);
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
            <TouchableOpacity onPress={handleReset}>
              <Ionicons name="refresh" size={24} color="#ffffff" />
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



      
      <Modal
        transparent
        visible={showResetModal}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <View style={{
            backgroundColor: '#1e1e1e',
            paddingVertical: 30,
            paddingHorizontal: 30,
            borderRadius: 20,
            width: '90%',
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: 15,
              textAlign: 'center',
            }}>Reset Plan</Text>
            <Text style={{
              fontSize: 16,
              color: '#ccc',
              marginBottom: 25,
              textAlign: 'center',
            }}>
              Are you sure you want to reset your plan?
            </Text>

            <LinearGradient
              colors={['#EF4444', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 30,
                width: '100%',
              }}
            >
              <Pressable
                style={{
                  paddingVertical: 15,
                  borderRadius: 30,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setShowResetModal(false);
                  onReset?.();
                }}
              >
                <Text style={{ fontWeight: 'bold', color: '#000', fontSize: 16 }}>
                  Reset Plan
                </Text>
              </Pressable>
            </LinearGradient>

            <Pressable
              style={{
                marginTop: 10,
                paddingVertical: 15,
                width: '100%',
                backgroundColor: '#333',
                borderRadius: 30,
                alignItems: 'center',
              }}
              onPress={() => setShowResetModal(false)}
            >
              <Text style={{ color: '#fff', fontSize: 16 }}>Cancel</Text>
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
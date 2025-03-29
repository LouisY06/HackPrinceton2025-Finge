// src/BottomNav.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

type TabName = 'home' | 'portfolio' | 'market' | 'wishlist';

interface BottomNavProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
}

// Use the keys from Ionicons.glyphMap for a stricter type check.
interface NavItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <View style={styles.bottomNav}>
      <NavItem
        icon="home-outline"
        label="Home"
        isActive={activeTab === 'home'}
        onPress={() => setActiveTab('home')}
      />
      <NavItem
        icon="pie-chart-outline"
        label="Portfolio"
        isActive={activeTab === 'portfolio'}
        onPress={() => setActiveTab('portfolio')}
      />
      <NavItem
        icon="trending-up-outline"
        label="Market"
        isActive={activeTab === 'market'}
        onPress={() => setActiveTab('market')}
      />
      <NavItem
        icon="star-outline"
        label="Wish List"
        isActive={activeTab === 'wishlist'}
        onPress={() => setActiveTab('wishlist')}
      />
    </View>
  );
}

function NavItem({ icon, label, isActive, onPress }: NavItemProps) {
  const color = isActive ? '#007AFF' : '#888';
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.navText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    height: 60,
    width: SCREEN_WIDTH,
    borderTopWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
  },
  navItem: { alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 12, marginTop: 2 },
});
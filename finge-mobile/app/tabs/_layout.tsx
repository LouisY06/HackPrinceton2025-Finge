import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { PortfolioProvider } from './PortfolioContext'; // Adjust the path as needed

const { width } = Dimensions.get('window');

// 1) Type for Ionicons name
type IoniconsName = ComponentProps<typeof Ionicons>['name'];

// 2) Define route names
type TabRoute = 'discover' | 'portfolio' | 'trade' | 'camera' | 'profile';

// 3) getTabIcon returns a valid Ionicons name
const getTabIcon = (routeName: TabRoute, isSelected: boolean): IoniconsName => {
  const iconMap: Record<TabRoute, IoniconsName> = {
    discover: isSelected ? 'compass' : 'compass-outline',
    portfolio: isSelected ? 'pie-chart' : 'pie-chart-outline',
    trade: isSelected ? 'trending-up' : 'trending-up-outline',
    camera: isSelected ? 'camera' : 'camera-outline',
    profile: isSelected ? 'person' : 'person-outline',
  };

  return iconMap[routeName] || 'help-circle-outline';
};

export default function AppLayout() {
  return (
    <PortfolioProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#777',
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={getTabIcon('discover', focused)}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="portfolio"
          options={{
            title: 'Portfolio',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={getTabIcon('portfolio', focused)}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="trade"
          options={{
            title: 'Trade',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={getTabIcon('trade', focused)}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={getTabIcon('camera', focused)}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={getTabIcon('profile', focused)}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </PortfolioProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: -2,
  },
});
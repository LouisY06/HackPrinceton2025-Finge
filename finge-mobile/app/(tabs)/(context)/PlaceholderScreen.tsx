// src/PlaceholderScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlaceholderProps {
  title: string;
}

export default function PlaceholderScreen({ title }: PlaceholderProps) {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>{title} Screen</Text>
      <Text style={{ color: '#888' }}>Content goes here...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  placeholderText: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
});
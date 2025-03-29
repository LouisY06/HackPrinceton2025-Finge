// src/PortfolioScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface PortfolioScreenProps {
  onReadInsights: () => void;
}

export default function PortfolioScreen({ onReadInsights }: PortfolioScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.portfolioContainer}>
      <View style={styles.portfolioHeader}>
        <Text style={styles.welcomeText}>Welcome Sam.</Text>
        <Text style={styles.checkText}>Check out how your portfolio is doing</Text>
        <TouchableOpacity style={styles.readInsightsButton} onPress={onReadInsights}>
          <Text style={styles.readInsightsButtonText}>Read Insights</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.portfolioTitle}>Your Portfolio</Text>
      <TouchableOpacity style={styles.listToggle}>
        <Text style={styles.listToggleText}>List View</Text>
      </TouchableOpacity>
      {/* Hard-coded items for now */}
      <PortfolioItem title="Apple Inc." subtitle="AAPL" price="₹2,509.75" change="+1.97%" />
      <PortfolioItem title="Boeing" subtitle="BA" price="₹2,509.75" change="-0.15%" />
      <PortfolioItem title="Berkshire Hathaway" subtitle="BRK-B" price="$553.06" change="+0.20%" />
      <PortfolioItem title="General Motors Comp." subtitle="GM" price="$105.06" change="-0.65%" />
      <PortfolioItem title="Home Depot" subtitle="HD" price="₹2,509.75" change="+2.35%" />
      <PortfolioItem title="Starbucks" subtitle="SBUX" price="$73.00" change="-0.20%" />
    </ScrollView>
  );
}

interface PortfolioItemProps {
  title: string;
  subtitle: string;
  price: string;
  change: string;
}

function PortfolioItem({ title, subtitle, price, change }: PortfolioItemProps) {
  return (
    <View style={styles.portfolioItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.portfolioItemTitle}>{title}</Text>
        <Text style={styles.portfolioItemSubtitle}>{subtitle}</Text>
      </View>
      <View style={styles.priceContainerRow}>
        <Text style={styles.priceText}>{price}</Text>
        <Text style={styles.changeText}>{change}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  portfolioContainer: { paddingBottom: 80 },
  portfolioHeader: { backgroundColor: '#007AFF20', padding: 16, marginBottom: 16 },
  welcomeText: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  checkText: { fontSize: 16, color: '#444', marginBottom: 8 },
  readInsightsButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  readInsightsButtonText: { color: '#fff', fontSize: 14 },
  portfolioTitle: { fontSize: 18, fontWeight: '600', paddingHorizontal: 16, marginBottom: 8 },
  listToggle: { position: 'absolute', right: 16, top: 68, padding: 4 },
  listToggleText: { color: '#007AFF', fontSize: 14 },
  portfolioItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  portfolioItemTitle: { fontSize: 16, fontWeight: '500' },
  portfolioItemSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  priceContainerRow: { alignItems: 'flex-end' },
  priceText: { fontSize: 16, fontWeight: '500' },
  changeText: { fontSize: 12, color: 'green' },
});
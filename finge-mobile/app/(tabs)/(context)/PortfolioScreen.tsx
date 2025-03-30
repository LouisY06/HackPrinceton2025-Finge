// src/PortfolioScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

export interface PortfolioItemType {
  key: string;
  title: string;
  subtitle: string;
  price: string;
  change: string;
}

interface PortfolioScreenProps {
  portfolioItems: PortfolioItemType[];
}

export default function PortfolioScreen({ portfolioItems }: PortfolioScreenProps) {
  const router = useRouter();

  const handleReadInsights = () => {
    // Use an absolute route path.
// Instead of an absolute file path, use the route path defined by your folder structure:
  router.push('/(tabs)/(context)/InsightsFlashcard');  
};

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {/* Header White Box */}
        <View style={styles.headerBox}>
          <Text style={styles.welcomeText}>Welcome Sam.</Text>
          <Text style={styles.checkText}>Check out how your portfolio is doing</Text>
          <TouchableOpacity style={styles.readInsightsButton} onPress={handleReadInsights}>
            <Text style={styles.readInsightsButtonText}>Read Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio Content White Box */}
        <View style={styles.scrollableContainer}>
          <ScrollView contentContainerStyle={styles.portfolioListContainer}>
            <Text style={styles.portfolioTitle}>Your Portfolio</Text>
            {portfolioItems.map((item) => (
              <View key={item.key} style={styles.portfolioItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.portfolioItemTitle}>{item.title}</Text>
                  <Text style={styles.portfolioItemSubtitle}>{item.subtitle}</Text>
                </View>
                <View style={styles.priceContainerRow}>
                  <Text style={styles.priceText}>{item.price}</Text>
                  <Text style={styles.changeText}>{item.change}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  headerBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Android elevation
    elevation: 2,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  checkText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
  },
  readInsightsButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  readInsightsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollableContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  portfolioListContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  portfolioTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  portfolioItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  portfolioItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  portfolioItemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  priceContainerRow: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  changeText: {
    fontSize: 12,
    color: 'green',
  },
});

export { PortfolioScreen };
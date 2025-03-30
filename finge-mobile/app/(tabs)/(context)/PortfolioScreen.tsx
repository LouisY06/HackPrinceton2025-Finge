// src/PortfolioScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

interface PortfolioScreenProps {
  onReadInsights: () => void;
  onSwipeRight: (item: { title: string; subtitle: string; price: string; change: string }) => void;
}

export default function PortfolioScreen({ onReadInsights, onSwipeRight }: PortfolioScreenProps) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Fixed header */}
        <View style={styles.portfolioHeader}>
          <Text style={styles.welcomeText}>Welcome Sam.</Text>
          <Text style={styles.checkText}>Check out how your portfolio is doing</Text>
          <TouchableOpacity style={styles.readInsightsButton} onPress={onReadInsights}>
            <Text style={styles.readInsightsButtonText}>Read Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable portfolio list container */}
        <View style={styles.scrollableContainer}>
          <ScrollView contentContainerStyle={styles.portfolioListContainer}>
            <Text style={styles.portfolioTitle}>Your Portfolio</Text>
            <PortfolioItem
              title="Apple Inc."
              subtitle="AAPL"
              price="₹2,509.75"
              change="+1.97%"
              onSwipeRight={onSwipeRight}
            />
            {/* You can add more PortfolioItems here */}
          </ScrollView>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

interface PortfolioItemProps {
  title: string;
  subtitle: string;
  price: string;
  change: string;
  onSwipeRight: (item: { title: string; subtitle: string; price: string; change: string }) => void;
}

function PortfolioItem({ title, subtitle, price, change, onSwipeRight }: PortfolioItemProps) {
  return (
    <Swipeable
      onSwipeableRightOpen={() =>
        onSwipeRight({ title, subtitle, price, change })
      }
      renderRightActions={() => (
        <View style={styles.swipeAction}>
          <Text style={styles.swipeActionText}>Add</Text>
        </View>
      )}
    >
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
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  portfolioHeader: { 
    backgroundColor: '#F0F0F0', 
    padding: 20, 
    margin: 16, 
    borderRadius: 16, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2, 
    elevation: 2 
  },
  welcomeText: { fontSize: 22, fontWeight: '600', marginBottom: 4, color: '#333' },
  checkText: { fontSize: 16, color: '#555', marginBottom: 12 },
  readInsightsButton: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#007AFF', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 20 
  },
  readInsightsButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  scrollableContainer: { 
    flex: 1, 
    marginHorizontal: 16, 
    marginBottom: 16, 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    overflow: 'hidden' 
  },
  portfolioListContainer: { padding: 16, paddingBottom: 24 },
  portfolioTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12, color: '#333' },
  portfolioItem: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    marginBottom: 12, 
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center' 
  },
  portfolioItemTitle: { fontSize: 16, fontWeight: '500', color: '#333' },
  portfolioItemSubtitle: { fontSize: 12, color: '#666', marginTop: 2 },
  priceContainerRow: { alignItems: 'flex-end', justifyContent: 'center' },
  priceText: { fontSize: 16, fontWeight: '500', color: '#333' },
  changeText: { fontSize: 12, color: 'green' },
  swipeAction: { 
    backgroundColor: '#4CAF50', 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: 80, 
    borderTopRightRadius: 16, 
    borderBottomRightRadius: 16 
  },
  swipeActionText: { color: '#fff', fontWeight: 'bold' },
});

export { PortfolioScreen };
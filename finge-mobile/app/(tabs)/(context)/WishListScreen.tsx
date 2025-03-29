// src/WishListScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WISH_LIST, WishItem } from './data';

export default function WishListScreen() {
  const [wishReadingMode, setWishReadingMode] = useState<boolean>(false);
  const [selectedWish, setSelectedWish] = useState<WishItem | null>(null);

  const handlePress = (item: WishItem) => {
    setSelectedWish(item);
    setWishReadingMode(true);
  };

  return (
    <View style={styles.wishListContainer}>
      <Text style={styles.wishListTitle}>Wish List</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {WISH_LIST.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.wishCard}
            onPress={() => handlePress(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="star-outline" size={20} color="#888" style={styles.wishStarIcon} />
            <Text style={styles.wishCompanyTitle}>{item.name}</Text>
            <Text style={styles.wishSubtitle}>{item.subTitle}</Text>
            <View style={styles.wishStatsRow}>
              <Text style={styles.wishStatsText}>Vol: {item.vol}</Text>
              <Text style={styles.wishStatsText}>P/E: {item.pe}</Text>
              <Text style={styles.wishStatsText}>Mkt Cap: {item.mktCap}</Text>
            </View>
            <View style={styles.wishStatsRow}>
              <Text style={styles.wishStatsText}>Yield: {item.yield}</Text>
              <Text style={styles.wishStatsText}>Beta: {item.beta}</Text>
              <Text style={styles.wishStatsText}>EPS: {item.eps}</Text>
            </View>
            <View style={styles.lineChartPlaceholder}>
              <Text style={{ color: '#999' }}>Line Chart</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {wishReadingMode && selectedWish && (
        <View style={styles.readingModeContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setWishReadingMode(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.readingContentContainer}>
            <Text style={styles.articleTitle}>{selectedWish.name}</Text>
            <Text style={styles.articleContent}>{selectedWish.readingText}</Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wishListContainer: { flex: 1, width: '100%', alignItems: 'flex-start', paddingTop: 16, paddingHorizontal: 16, paddingBottom: 60 },
  wishListTitle: { fontSize: 20, fontWeight: '600', marginBottom: 16 },
  wishCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  wishStarIcon: { position: 'absolute', top: 12, right: 12 },
  wishCompanyTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  wishSubtitle: { fontSize: 14, color: '#666', marginBottom: 8 },
  wishStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  wishStatsText: { fontSize: 12, color: '#444' },
  lineChartPlaceholder: { marginTop: 8, backgroundColor: '#f3f3f3', height: 50, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  readingModeContainer: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#fff', zIndex: 10 },
  closeButton: { alignSelf: 'flex-end', padding: 16 },
  closeButtonText: { fontSize: 20, fontWeight: 'bold' },
  readingContentContainer: { padding: 20, paddingBottom: 80 },
  articleTitle: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  articleContent: { fontSize: 16, lineHeight: 24, color: '#444' },
});
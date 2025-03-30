 // WishListScreen.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import SwipeableWishCard, { WishItem } from './SwipeableWishCard';

interface WishListScreenProps {
  wishList: WishItem[];
  onRemoveWish: (key: string) => void;
}

export default function WishListScreen({ wishList, onRemoveWish }: WishListScreenProps) {
  return (
    <View style={styles.wishListContainer}>
      <Text style={styles.wishListTitle}>Wish List</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {wishList.map((item) => (
          <SwipeableWishCard key={item.key} item={item} onRemove={onRemoveWish} />
        ))}
      </ScrollView>
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
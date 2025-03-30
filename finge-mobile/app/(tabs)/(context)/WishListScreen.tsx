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
  wishListContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 60,
    backgroundColor: '#f0f0f0',
  },
  wishListTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
});
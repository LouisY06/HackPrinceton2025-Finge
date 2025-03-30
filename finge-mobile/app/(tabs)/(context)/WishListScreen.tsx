import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import SwipeableWishCard, { WishItem } from './SwipeableWishCard';

interface WishListScreenProps {
  wishList: WishItem[];
  onRemoveWish: (key: string) => void;
  onMarkWish: (key: string) => void;
}

export default function WishListScreen({ wishList, onRemoveWish, onMarkWish }: WishListScreenProps) {
  return (
    <View style={styles.wishListContainer}>
      <View style={styles.card}>
        <Text style={styles.wishListTitle}>Wish List</Text>
        {wishList.length === 0 ? (
          <Text style={styles.emptyText}>Add more stocks</Text>
        ) : (
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            {wishList.map((item) => (
              <SwipeableWishCard 
                key={item.key} 
                item={item} 
                onRemove={onRemoveWish} 
                onMark={onMarkWish} 
              />
            ))}
          </ScrollView>
        )}
      </View>
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
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    minHeight: 300,
    marginTop: 40, // Added margin to move the box down
  },
});

export { WishListScreen };
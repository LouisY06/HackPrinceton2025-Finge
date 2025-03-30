// SwipeableWishCard.tsx
import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

export interface WishItem {
  key: string;
  title: string;
  subtitle: string;
  price?: string;
  change?: string;
  readingText?: string;
}

interface SwipeableWishCardProps {
  item: WishItem;
  onRemove: (key: string) => void;
  onMark: (key: string) => void;
}

export default function SwipeableWishCard({ item, onRemove, onMark }: SwipeableWishCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => setExpanded((prev) => !prev)}
      style={styles.container}
    >
      <View style={styles.wrapper}>
        <View style={styles.cardContent}>
          <Ionicons name="star-outline" size={20} color="#888" style={styles.wishStarIcon} />
          <Text style={styles.wishCompanyTitle}>{item.title}</Text>
          <Text style={styles.wishSubtitle}>{item.subtitle}</Text>
          <View style={styles.wishStatsRow}>
            <Text style={styles.wishStatsText}>Price: {item.price}</Text>
            <Text style={styles.wishStatsText}>Change: {item.change}</Text>
          </View>
        </View>
        {expanded && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => onRemove(item.key)}>
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => onMark(item.key)}>
              <Text style={styles.actionButtonText}>Mark in Portfolio</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
    alignItems: 'center',
  },
  wrapper: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden', // Ensures one continuous border curve
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  wishStarIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  wishCompanyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  wishSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  wishStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  wishStatsText: {
    fontSize: 12,
    color: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#fff',
    // No extra border radius here; the wrapper's borderRadius applies uniformly.
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

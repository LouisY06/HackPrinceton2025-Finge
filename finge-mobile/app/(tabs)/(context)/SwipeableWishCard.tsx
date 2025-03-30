import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD_HORIZONTAL = 0.25 * SCREEN_WIDTH;

// 1) Named export for the interface
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
}

export default function SwipeableWishCard({ item, onRemove }: SwipeableWishCardProps) {
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
      },
      onPanResponderRelease: (_, gesture) => {
        // If swiped left past the threshold, animate off-screen and remove
        if (gesture.dx < -SWIPE_THRESHOLD_HORIZONTAL) {
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH, y: 0 },
            duration: 250,
            useNativeDriver: true,
          }).start(() => onRemove(item.key));
        } else {
          // Otherwise, snap back
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View style={{ transform: position.getTranslateTransform() }} {...panResponder.panHandlers}>
      <TouchableOpacity style={styles.wishCard} activeOpacity={0.8}>
        <Ionicons name="star-outline" size={20} color="#888" style={styles.wishStarIcon} />
        <Text style={styles.wishCompanyTitle}>{item.title}</Text>
        <Text style={styles.wishSubtitle}>{item.subtitle}</Text>
        <View style={styles.wishStatsRow}>
          <Text style={styles.wishStatsText}>Price: {item.price}</Text>
          <Text style={styles.wishStatsText}>Change: {item.change}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
});
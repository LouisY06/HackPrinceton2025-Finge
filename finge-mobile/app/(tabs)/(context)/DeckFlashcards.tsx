// DeckFlashcards.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD_HORIZONTAL = 0.05 * SCREEN_WIDTH;
const SWIPE_THRESHOLD_VERTICAL = 150;

// Extended interface to hold the extra fields
interface CardData {
  key: string;
  companyName: string;
  subTitle: string;
  price?: string;
  priceChange?: string;
  stats?: { label: string; value: string }[];
  additionalStats?: string[];
  tabs?: string[];
  contentCards?: { title: string; text: string }[];
}

interface DeckFlashcardsProps {
  deckIndex: number;
  setDeckIndex: React.Dispatch<React.SetStateAction<number>>;
  onSwipeRight: (card: CardData) => void;
}

// Updated data to match the style in your screenshot
const DECK_CARDS: CardData[] = [
  {
    key: 'nvidia',
    companyName: 'Nvidia Corp.',
    subTitle: 'NVDA',
    price: '105.97',
    priceChange: '+1.22 (1.16%)',
    stats: [
      { label: 'Vol', value: '827.5M' },
      { label: 'P/E', value: '37.50' },
      { label: 'Mkt Cap', value: '2.95T' },
    ],
    additionalStats: [
      'Profit Margin: 55.13%',
      'Operating Cash Flow: 64.03 B',
      'Levered Free Cash Flow: 53.13 B',
    ],
    tabs: ['All', 'Geopolitics', 'Product Releases'],
    contentCards: [
      {
        title: 'Nvidia Briefs',
        text: "Nvidia's Challenge to China. Chip making and global rivalry continue to shape the semiconductor landscape.",
      },
      {
        title: 'Industry Leadership',
        text: 'Known for its leadership in GPUs and AI, Nvidia is expanding into data centers, autonomous vehicles, and diversified strategies.',
      },
    ],
  },
  {
    key: 'shell',
    companyName: 'Shell (SHEL)',
    subTitle: '',
    price: '60.20',
    priceChange: '',
    stats: [
      { label: 'Vol', value: '15.4M' },
      { label: 'P/E', value: '6.90' },
      { label: 'Mkt Cap', value: '$200B' },
    ],
    additionalStats: [
      'Profit Margin: 9.80%',
      'Operating Cash Flow: $50 B',
      'Levered Free Cash Flow: $30 B',
    ],
    tabs: ['All', 'Industry'],
    contentCards: [
      {
        title: 'Shell Overview',
        text: 'Open: $59.50, High: $60.70, Low: $59.10, Yield: 3.80%, Beta: 0.70, EPS: $8.70, Revenue: $300 B',
      },
    ],
  },
  {
    key: 'nike',
    companyName: 'Nike (NKE)',
    subTitle: '',
    price: '120.40',
    priceChange: '',
    stats: [
      { label: 'Vol', value: '5.2M' },
      { label: 'P/E', value: '32.80' },
      { label: 'Mkt Cap', value: '$180B' },
    ],
    additionalStats: [
      'Profit Margin: 11.80%',
      'Operating Cash Flow: $7 B',
      'Levered Free Cash Flow: $4 B',
    ],
    tabs: ['All', 'Industry'],
    contentCards: [
      {
        title: 'Nike Overview',
        text: 'Open: $119.50, High: $121.70, Low: $119.10, Yield: 1.15%, Beta: 0.80, EPS: $3.45, Revenue: $47 B',
      },
    ],
  },
];

export default function DeckFlashcards({
  deckIndex,
  setDeckIndex,
  onSwipeRight,
}: DeckFlashcardsProps) {
  const [readingMode, setReadingMode] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  const resetCard = () => {
    position.setValue({ x: 0, y: 0 });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !readingMode,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -SWIPE_THRESHOLD_VERTICAL) {
          // Swipe up (optional): toggle reading mode if desired
          resetCard();
          setReadingMode(true);
        } else if (gesture.dx > SWIPE_THRESHOLD_HORIZONTAL) {
          // Swipe right: add to wishlist then advance deck
          onSwipeRight(DECK_CARDS[deckIndex]);
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH, y: gesture.dy },
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            resetCard();
            setDeckIndex(deckIndex + 1);
          });
        } else if (gesture.dx < -SWIPE_THRESHOLD_HORIZONTAL) {
          // Swipe left: advance deck without saving
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH, y: gesture.dy },
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            resetCard();
            setDeckIndex(deckIndex + 1);
          });
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  // If we've reached the end of the deck, show a placeholder
  if (deckIndex >= DECK_CARDS.length) {
    return (
      <View style={styles.noMoreCards}>
        <Text style={styles.noMoreCardsText}>No more cards</Text>
      </View>
    );
  }

  const card = DECK_CARDS[deckIndex];

  return (
    <View style={styles.deckContainer}>
      <Animated.View
        style={[
          styles.card,
          { transform: [...position.getTranslateTransform(), { rotate }] },
        ]}
        {...panResponder.panHandlers}
      >
        <ScrollView contentContainerStyle={styles.cardInner}>
          {/* Company & Ticker */}
          <Text style={styles.companyName}>{card.companyName}</Text>
          {card.subTitle ? <Text style={styles.ticker}>{card.subTitle}</Text> : null}

          {/* Price & Change */}
          {(card.price || card.priceChange) && (
            <View style={styles.priceRow}>
              {card.price ? <Text style={styles.price}>{card.price}</Text> : null}
              {card.priceChange ? <Text style={styles.priceChange}>{card.priceChange}</Text> : null}
            </View>
          )}

          {/* Stats Row */}
          {card.stats && (
            <View style={styles.statsRow}>
              {card.stats.map((stat, index) => (
                <View key={index} style={styles.statBox}>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                  <Text style={styles.statValue}>{stat.value}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Additional Stats */}
          {card.additionalStats && (
            <View style={styles.additionalStats}>
              {card.additionalStats.map((line, index) => (
                <Text key={index} style={styles.additionalStatLine}>
                  {line}
                </Text>
              ))}
            </View>
          )}

          {/* Tabs */}
          {card.tabs && (
            <View style={styles.tabsRow}>
              {card.tabs.map((tabName, index) => (
                <View key={index} style={styles.tab}>
                  <Text style={styles.tabText}>{tabName}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Content Cards */}
          {card.contentCards && (
            <View>
              {card.contentCards.map((content, index) => (
                <View key={index} style={styles.contentCard}>
                  <Text style={styles.contentTitle}>{content.title}</Text>
                  <Text style={styles.contentText}>{content.text}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Hint (for reading mode) */}
          <Text style={styles.swipeHint}>Swipe up for full article reading mode</Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  deckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  cardInner: {
    padding: 16,
  },
  noMoreCards: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '80%',
  },
  noMoreCardsText: {
    fontSize: 18,
    color: '#888',
  },

  // Header
  companyName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  ticker: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },

  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  priceChange: {
    fontSize: 16,
    color: 'green',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },

  // Additional Stats
  additionalStats: {
    marginBottom: 16,
  },
  additionalStatLine: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },

  // Tabs
  tabsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tab: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
  },
  tabText: {
    fontSize: 12,
    color: '#444',
  },

  // Content Cards
  contentCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  contentText: {
    fontSize: 14,
    color: '#444',
  },

  // Hint
  swipeHint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});
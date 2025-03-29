// src/DeckFlashcards.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DeckCard } from './data'; // DeckCard interface from data.ts

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD_HORIZONTAL = 0.25 * SCREEN_WIDTH;
const SWIPE_THRESHOLD_VERTICAL = 150;

// Define five demo tickers.
const demoTickers = ['AAPL', 'MSFT', 'AMZN', 'TSLA', 'GOOGL'];

export default function DeckFlashcards() {
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [readingMode, setReadingMode] = useState<boolean>(false);
  const position = useRef(new Animated.ValueXY()).current;

  // Fetch each ticker's data from the backend.
  useEffect(() => {
    const fetchDeckCards = async () => {
      try {
        const baseURL = 'http://10.29.252.198:8000/stock/'; // Replace <YOUR_IP_ADDRESS> with your Mac's LAN IP.
        const fetchedCards: DeckCard[] = await Promise.all(
          demoTickers.map(async ticker => {
            const response = await fetch(`${baseURL}${ticker}`);
            if (!response.ok) {
              throw new Error(`Failed to fetch data for ${ticker}`);
            }
            const data = await response.json();
            return data; // Data is already in DeckCard format.
          })
        );
        setDeckCards(fetchedCards);
      } catch (error) {
        console.error('Error fetching deck cards:', error);
      }
    };
    fetchDeckCards();
  }, []);

  const resetCard = () => {
    position.setValue({ x: 0, y: 0 });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (): boolean => !readingMode,
      onPanResponderMove: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
        if (gesture.dy < -SWIPE_THRESHOLD_VERTICAL) {
          // If swiped up beyond threshold, switch to reading mode.
          resetCard();
          setReadingMode(true);
        } else if (Math.abs(gesture.dx) > SWIPE_THRESHOLD_HORIZONTAL) {
          const direction = gesture.dx > 0 ? 1 : -1;
          Animated.timing(position, {
            toValue: { x: direction * SCREEN_WIDTH, y: gesture.dy },
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            resetCard();
            setCurrentIndex(prev => prev + 1);
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
    outputRange: ['-20deg', '0deg', '20deg'],
    extrapolate: 'clamp',
  });

  if (deckCards.length === 0) {
    return (
      <View style={styles.noMoreCards}>
        <Text style={styles.noMoreCardsText}>Loading cards...</Text>
      </View>
    );
  }

  if (currentIndex >= deckCards.length) {
    return (
      <View style={styles.noMoreCards}>
        <Text style={styles.noMoreCardsText}>No more cards</Text>
      </View>
    );
  }

  const card: DeckCard = deckCards[currentIndex];
  const animatedStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
  };

  return (
    <View style={styles.deckContainer}>
      <Animated.View style={[styles.card, animatedStyle]} {...panResponder.panHandlers}>
        {renderCardContent(card)}
      </Animated.View>

      {readingMode && (
        <View style={styles.readingModeContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setReadingMode(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.readingContentContainer}>
            <Text style={styles.articleTitle}>{card.companyName} Full Article</Text>
            <Text style={styles.articleContent}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function renderCardContent(card: DeckCard) {
  return (
    <ScrollView contentContainerStyle={styles.cardContentContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{card.companyName}</Text>
        {card.subTitle && <Text style={styles.subtitle}>{card.subTitle}</Text>}
        {(card.price || card.priceChange) && (
          <View style={styles.priceContainer}>
            {card.price && <Text style={styles.price}>{card.price}</Text>}
            {card.priceChange && <Text style={styles.priceChange}>{card.priceChange}</Text>}
          </View>
        )}
      </View>
      {card.stats && (
        <View style={styles.statsRow}>
          {card.stats.map((stat, index) => (
            <View key={index} style={styles.statsBox}>
              <Text style={styles.statsTitle}>{stat.label}</Text>
              <Text style={styles.statsValue}>{stat.value}</Text>
            </View>
          ))}
        </View>
      )}
      {card.additionalStats && card.additionalStats.length > 0 && (
        <View style={styles.additionalStats}>
          {card.additionalStats.map((text, index) => (
            <Text key={index} style={styles.additionalStatText}>{text}</Text>
          ))}
        </View>
      )}
      <View style={styles.tabsContainer}>
        {card.tabs?.map((tabName, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tabButton, index === 0 && styles.tabActive]}
          >
            <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>
              {tabName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {card.contentCards?.map((content, index) => (
        <View key={index} style={styles.contentCard}>
          <Text style={styles.contentTitle}>{content.title}</Text>
          <Text style={styles.contentText}>{content.text}</Text>
        </View>
      ))}
      <Text style={styles.swipeHint}>Swipe up for full article reading mode</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  deckContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  card: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  cardContentContainer: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 6,
  },
  priceChange: {
    fontSize: 16,
    color: 'green',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  statsBox: {
    alignItems: 'center',
    flex: 1,
  },
  statsTitle: {
    fontSize: 14,
    color: '#999',
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  additionalStats: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginBottom: 16,
  },
  additionalStatText: {
    fontSize: 14,
    color: '#444',
    marginVertical: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#444',
  },
  tabTextActive: {
    color: '#fff',
  },
  contentCard: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  swipeHint: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    marginTop: 10,
  },
  readingModeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 16,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  readingContentContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
});

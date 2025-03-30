// DeckFlashcards.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Modal,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const useAPI = true;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD_HORIZONTAL = 0.25 * SCREEN_WIDTH;
const SWIPE_THRESHOLD_VERTICAL = 150;

export interface CardData {
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

// DO NOT rename DECK_CARDS.
let DECK_CARDS: CardData[] = [
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

const demoTickers = ['AAPL', 'MSFT', 'AMZN', 'TSLA', 'GOOGL'];

// Global variable to hold the dummy state updater for re-rendering.
let globalForceRefresh: () => void = () => {};

export function setGlobalForceRefresh(forceRefreshFn: () => void) {
  globalForceRefresh = forceRefreshFn;
}

// Exported helper function to add a new card to the front of the deck.
// This is to be called from CameraScanner after image upload.
export function addCardToFront(newCard: CardData) {
  DECK_CARDS.unshift(newCard);
  globalForceRefresh();
}

export default function DeckFlashcards({
  deckIndex,
  setDeckIndex,
  onSwipeRight,
}: DeckFlashcardsProps) {
  const [readingMode, setReadingMode] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isReady, setIsReady] = useState(false);
  const [refresh, setRefresh] = useState(false); // Dummy state to force re-render
  const position = useRef(new Animated.ValueXY()).current;

  // Register the dummy state updater globally for addCardToFront.
  useEffect(() => {
    setGlobalForceRefresh(() => setRefresh(prev => !prev));
  }, []);

  // On mount, if useAPI is true, fetch the deck cards and update DECK_CARDS.
  useEffect(() => {
    if (useAPI) {
      if (DECK_CARDS.length === 3) { // assume 3 cards is the original dummy deck
        const fetchDeckCards = async () => {
          try {
            const baseURL = 'http://10.29.252.198:8000/stock/'; // API endpoint
            const fetchedCards: CardData[] = await Promise.all(
              demoTickers.map(async (ticker) => {
                const response = await fetch(`${baseURL}${ticker}`);
                if (!response.ok) {
                }
                const data = await response.json();
                return data; // API returns data in the same format as DECK_CARDS.
              })
            );
            // Replace DECK_CARDS with fetched data:
            DECK_CARDS.length = 0;
            DECK_CARDS.push(...fetchedCards);
            setIsReady(true);
            setRefresh(prev => !prev);
            setDeckIndex(0);
          } catch (error) {
            console.error('Error fetching deck cards from API:', error);
            setIsReady(true);
          }
        };
        fetchDeckCards();
      } else {
        setIsReady(true);
      }
    } else {
      setIsReady(true);
    }
  }, []);

  // Reset the animated position when deckIndex changes.
  useEffect(() => {
    position.setValue({ x: 0, y: 0 });
  }, [deckIndex, position]);

  // Helper: reset card position.
  const resetCard = () => {
    position.setValue({ x: 0, y: 0 });
  };

  // Helper: run animation with fallback.
  const runAnimation = (
    animation: Animated.CompositeAnimation,
    callback?: () => void
  ) => {
    let hasReset = false;
    const safeReset = () => {
      if (!hasReset) {
        hasReset = true;
        resetCard();
        setIsAnimating(false);
        if (callback) callback();
      }
    };

    animation.start(({ finished }) => {
      if (finished) {
        safeReset();
      }
    });
    setTimeout(safeReset, 350);
  };

  // Helper: fetch a new card using the recommendation endpoint and append it to the back of DECK_CARDS.
  const fetchNewCard = async () => {
    try {
      // Get a recommended ticker.
      const recResponse = await fetch('http://10.29.252.198:8000/stock_recommendation');
      if (!recResponse.ok) {
      }
      const recData = await recResponse.json();
      const recommendedTicker = recData.ticker;
      // Now fetch the card data for that ticker.
      const baseURL = 'http://10.29.252.198:8000/stock/';
      const response = await fetch(`${baseURL}${recommendedTicker}`);
      if (!response.ok) {
      }
      const newCard: CardData = await response.json();
      // Append the new card at the back.
      DECK_CARDS.push(newCard);
      setRefresh(prev => !prev); // Force re-render.
    } catch (error) {
      console.error("Error fetching new card:", error);
    }
  };

  // Process a right swipe.
  const processRightSwipe = (gestureDy: number = 0) => {
    const card = DECK_CARDS[0]; // Always take the first card.
    onSwipeRight(card);
    // Remove the first card from the queue.
    DECK_CARDS.shift();
    setDeckIndex(0);
    runAnimation(
      Animated.timing(position, {
        toValue: { x: SCREEN_WIDTH, y: gestureDy },
        duration: 300,
        useNativeDriver: true,
      })
    );
    fetchNewCard();
  };

  // Process a left swipe.
  const processLeftSwipe = (gestureDy: number = 0) => {
    // Remove the first card without calling onSwipeRight.
    DECK_CARDS.shift();
    setDeckIndex(0);
    runAnimation(
      Animated.timing(position, {
        toValue: { x: -SCREEN_WIDTH, y: gestureDy },
        duration: 300,
        useNativeDriver: true,
      })
    );
    fetchNewCard();
  };

  const handleButtonSwipeRight = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    processRightSwipe();
  };

  const handleButtonSwipeLeft = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    processLeftSwipe();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (): boolean => !readingMode && !isAnimating,
      onPanResponderMove: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_: GestureResponderEvent, gesture: PanResponderGestureState) => {
        if (Math.abs(gesture.dx) > Math.abs(gesture.dy)) {
          if (gesture.dx > SWIPE_THRESHOLD_HORIZONTAL) {
            setIsAnimating(true);
            processRightSwipe(gesture.dy);
          } else if (gesture.dx < -SWIPE_THRESHOLD_HORIZONTAL) {
            setIsAnimating(true);
            processLeftSwipe(gesture.dy);
          } else {
            runAnimation(
              Animated.spring(position, {
                toValue: { x: 0, y: 0 },
                friction: 6,
                tension: 100,
                useNativeDriver: true,
              })
            );
          }
        } else {
          if (gesture.dy < -SWIPE_THRESHOLD_VERTICAL) {
            resetCard();
            setReadingMode(true);
          } else {
            runAnimation(
              Animated.spring(position, {
                toValue: { x: 0, y: 0 },
                friction: 6,
                tension: 100,
                useNativeDriver: true,
              })
            );
          }
        }
      },
      onPanResponderTerminate: () => {
        runAnimation(
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          })
        );
      },
    })
  ).current;

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading deck cards...</Text>
      </View>
    );
  }
  
  if (DECK_CARDS.length === 0) {
    return (
      <View style={styles.noMoreCards}>
        <Text style={styles.noMoreCardsText}>No more cards</Text>
      </View>
    );
  }

  // Always display the first card in the queue.
  const card: CardData = DECK_CARDS[0];
  const animatedStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
  };

  return (
    <View style={styles.deckContainer}>
      <Animated.View
        key={card.key}
        style={[styles.card, animatedStyle]}
        {...panResponder.panHandlers}
      >
        <ScrollView contentContainerStyle={styles.cardInner}>
          <Text style={styles.companyName}>{card.companyName}</Text>
          {card.subTitle ? <Text style={styles.ticker}>{card.subTitle}</Text> : null}
          {(card.price || card.priceChange) && (
            <View style={styles.priceRow}>
              {card.price ? <Text style={styles.price}>{card.price}</Text> : null}
              {card.priceChange ? <Text style={styles.priceChange}>{card.priceChange}</Text> : null}
            </View>
          )}
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
          {card.additionalStats && (
            <View style={styles.additionalStats}>
              {card.additionalStats.map((line, index) => (
                <Text key={index} style={styles.additionalStatLine}>{line}</Text>
              ))}
            </View>
          )}
          {card.tabs && (
            <View style={styles.tabsRow}>
              {card.tabs.map((tabName, index) => (
                <View key={index} style={styles.tab}>
                  <Text style={styles.tabText}>{tabName}</Text>
                </View>
              ))}
            </View>
          )}
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
          <Text style={styles.swipeHint}>Swipe up for full article reading mode</Text>
        </ScrollView>
      </Animated.View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleButtonSwipeLeft} style={styles.swipeButton}>
          <Ionicons name="close-circle" size={48} color="#ff4d4d" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleButtonSwipeRight} style={styles.swipeButton}>
          <Ionicons name="checkmark-circle" size={48} color="#4caf50" />
        </TouchableOpacity>
      </View>
      <Modal
        visible={readingMode}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setReadingMode(false)}
      >
        <View style={styles.readingModeContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setReadingMode(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.readingContentContainer}>
            <Text style={styles.articleTitle}>
              {card.companyName} (AAPL) Stock Analysis and Its Role in a Personal Portfolio
            </Text>
            <Text style={styles.articleContent}>
              Apple Inc. has long been considered one of the most influential and valuable companies globally, driven by its innovative product lines, strong brand loyalty, and consistent financial performance. As of recent years, Apple has continued to maintain its position as a market leader through sustained revenue growth, steady cash flow, and a strong balance sheet, even amidst periods of market uncertainty. These characteristics make Apple a frequent candidate for inclusion in personal investment portfolios.
              
              From a fundamentals perspective, Apple’s business is well-diversified across products and services. While flagship products like the iPhone remain central to its revenue, the company has significantly expanded its services segment, including Apple Music, iCloud, and Apple Pay. This transition not only supports recurring revenue streams but also reduces dependency on hardware sales alone. Furthermore, Apple’s ecosystem strategy fosters customer retention and cross-product integration, which adds to its competitive advantage.
              
              Apple’s financial strength is also reflected in its history of stable dividend payments and regular share buybacks, which provide additional value to shareholders. The company’s ability to return capital while still investing in research, development, and strategic acquisitions signals financial discipline and long-term vision. Moreover, Apple maintains one of the largest cash reserves among publicly listed companies, offering it flexibility during economic downturns.
              
              When considering Apple’s potential role in a personal stock portfolio, it serves well as a core holding due to its combination of growth and stability. Apple is often viewed as a “blue-chip” stock — a company with a reputation for quality and reliability. Its inclusion can help anchor a portfolio, offering a degree of protection during volatile markets while still contributing to capital appreciation over time. However, investors should also be aware of certain risks, such as reliance on global supply chains, regulatory challenges, and the competitive nature of the technology sector.
              
              For long-term investors, Apple offers a balanced opportunity. Its consistent performance, coupled with its potential for innovation and expansion into areas such as augmented reality, artificial intelligence, and financial services, could drive future growth. While no investment is without risk, Apple’s track record and financial resilience make it a reasonable and potentially rewarding addition to a diversified personal portfolio.
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#999',
  },
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
  additionalStats: {
    marginBottom: 16,
  },
  additionalStatLine: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
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
  swipeHint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  swipeButton: {
    marginHorizontal: 20,
  },
  readingModeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
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

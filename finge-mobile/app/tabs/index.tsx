import React, { useState, useRef, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  PanResponder, 
  Dimensions, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PortfolioContext } from './PortfolioContext'; // Adjust the path as needed

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;
const DETAILS_OFFSET = -150; // Vertical offset for details view

const dummyStocks = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: '₹98,509.75',
    change: '+1700.254',
    changePercent: '9.77%',
    logo: 'https://logo.clearbit.com/apple.com',
    description:
      'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    chart: 'https://via.placeholder.com/400x200?text=No+Chart',
  },
  {
    id: '2',
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: '₹87,342.50',
    change: '+1250.75',
    changePercent: '7.25%',
    logo: 'https://logo.clearbit.com/microsoft.com',
    description:
      'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
    chart: 'https://via.placeholder.com/400x200?text=No+Chart',
  },
  {
    id: '3',
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: '₹73,128.90',
    change: '+890.45',
    changePercent: '5.32%',
    logo: 'https://logo.clearbit.com/amazon.com',
    description:
      'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores worldwide.',
    chart: 'https://via.placeholder.com/400x200?text=No+Chart',
  },
  {
    id: '4',
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: '₹52,645.30',
    change: '-1240.80',
    changePercent: '-2.35%',
    logo: 'https://logo.clearbit.com/tesla.com',
    description:
      'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
    chart: 'https://via.placeholder.com/400x200?text=No+Chart',
  },
  {
    id: '5',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: '₹64,982.25',
    change: '+750.60',
    changePercent: '4.28%',
    logo: 'https://logo.clearbit.com/google.com',
    description:
      'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
    chart: 'https://via.placeholder.com/400x200?text=No+Chart',
  },
];

const StockSwipeScreen = () => {
  const [stocks] = useState(dummyStocks);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Use a ref for current index to ensure we always have the latest value
  const currentIndexRef = useRef(0);
  const [showDetails, setShowDetails] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const { addLikedStock, removeLikedStock } = useContext(PortfolioContext);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        if (!showDetails && gesture.dy < -50) {
          Animated.timing(position, {
            toValue: { x: gesture.dx, y: DETAILS_OFFSET },
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            setShowDetails(true);
          });
          return;
        }
        if (!showDetails) {
          position.setValue({ x: gesture.dx, y: 0 });
        } else {
          position.setValue({ x: 0, y: DETAILS_OFFSET + gesture.dy });
        }
      },
      onPanResponderRelease: (event, gesture) => {
        if (showDetails) {
          if (gesture.dy > 50) {
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }).start(() => {
              setShowDetails(false);
            });
          } else {
            Animated.spring(position, {
              toValue: { x: 0, y: DETAILS_OFFSET },
              useNativeDriver: false,
            }).start();
          }
          return;
        }
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const swipeRight = () => {
    const index = currentIndexRef.current;
    const stock = stocks[index];
    console.log('Liked', stock.symbol);
    // Add to portfolio only if it doesn't exist
    addLikedStock(stock);
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      currentIndexRef.current = index + 1;
      setCurrentIndex(currentIndexRef.current);
      position.setValue({ x: 0, y: 0 });
      setShowDetails(false);
    });
  };

  const swipeLeft = () => {
    const index = currentIndexRef.current;
    const stock = stocks[index];
    console.log('Disliked', stock.symbol);
    // Remove from portfolio if it exists
    removeLikedStock(stock);
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      currentIndexRef.current = index + 1;
      setCurrentIndex(currentIndexRef.current);
      position.setValue({ x: 0, y: 0 });
      setShowDetails(false);
    });
  };

  const handleManualSwipeRight = () => {
    if (!showDetails) swipeRight();
  };

  const handleManualSwipeLeft = () => {
    if (!showDetails) swipeLeft();
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const isPositive = (changeText: string): boolean => {
    return changeText.charAt(0) === '+';
  };

  const renderCards = () => {
    if (currentIndex >= stocks.length) {
      return (
        <View style={styles.noMoreCardsContainer}>
          <Text style={styles.noMoreCardsText}>No more stocks to swipe!</Text>
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => {
              currentIndexRef.current = 0;
              setCurrentIndex(0);
            }}
          >
            <Text style={styles.resetButtonText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const stock = stocks[currentIndex];
    const isChangePositive = isPositive(stock.change);

    const cardStyle = {
      ...styles.card,
      transform: [
        { translateX: position.x },
        { rotate: showDetails ? '0deg' : rotate },
        { translateY: position.y },
      ],
    };

    return (
      <Animated.View style={cardStyle} {...panResponder.panHandlers}>
        {/* Card header */}
        <View style={styles.cardHeader}>
          <View style={styles.stockTitleContainer}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoPlaceholder}>{stock.symbol.charAt(0)}</Text>
            </View>
            <View>
              <Text style={styles.stockName}>{stock.name}</Text>
              <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.starButton}>
            <Ionicons name="star-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        {/* Price info */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{stock.price}</Text>
          <Text style={[styles.change, { color: isChangePositive ? '#4CAF50' : '#F44336' }]}>
            {stock.change} ({stock.changePercent})
          </Text>
        </View>
        {/* Chart placeholder */}
        <View style={styles.chartContainer}>
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartLine} />
          </View>
        </View>
        {/* Details view */}
        {showDetails && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>About {stock.name}</Text>
            <Text style={styles.detailsText}>{stock.description}</Text>
            <View style={styles.metricsContainer}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Market Cap</Text>
                <Text style={styles.metricValue}>₹2.45T</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>P/E Ratio</Text>
                <Text style={styles.metricValue}>28.5</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Dividend</Text>
                <Text style={styles.metricValue}>0.62%</Text>
              </View>
            </View>
            <Text style={styles.swipeHint}>Swipe down to close</Text>
          </View>
        )}
        {/* Stamps and hint */}
        {!showDetails && (
          <>
            <Animated.View style={[styles.likeStamp, { opacity: likeOpacity }]}>
              <Text style={styles.stampText}>INVEST</Text>
            </Animated.View>
            <Animated.View style={[styles.dislikeStamp, { opacity: dislikeOpacity }]}>
              <Text style={styles.stampText}>PASS</Text>
            </Animated.View>
            <Text style={styles.swipeHint}>Swipe up for more details</Text>
          </>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Stocks</Text>
      </View>
      <View style={styles.cardsContainer}>{renderCards()}</View>
      {!showDetails && currentIndex < stocks.length && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={[styles.button, styles.dislikeButton]} onPress={handleManualSwipeLeft}>
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.likeButton]} onPress={handleManualSwipeRight}>
            <Ionicons name="checkmark" size={30} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    padding: 20,
    position: 'absolute',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoPlaceholder: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stockSymbol: {
    color: '#666',
    fontSize: 14,
  },
  starButton: {
    padding: 5,
  },
  priceContainer: {
    marginTop: 20,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  change: {
    fontSize: 16,
    marginTop: 5,
  },
  chartContainer: {
    flex: 1,
    marginTop: 20,
    justifyContent: 'center',
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
  },
  chartLine: {
    height: 2,
    backgroundColor: '#3498db',
    width: '100%',
  },
  detailsContainer: {
    marginTop: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  likeStamp: {
    position: 'absolute',
    top: '40%',
    right: 40,
    transform: [{ rotate: '30deg' }],
    borderWidth: 4,
    borderColor: '#4CAF50',
    borderRadius: 8,
    padding: 10,
  },
  dislikeStamp: {
    position: 'absolute',
    top: '40%',
    left: 40,
    transform: [{ rotate: '-30deg' }],
    borderWidth: 4,
    borderColor: '#F44336',
    borderRadius: 8,
    padding: 10,
  },
  stampText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F44336',
    letterSpacing: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  likeButton: {
    backgroundColor: '#4CAF50',
  },
  dislikeButton: {
    backgroundColor: '#F44336',
  },
  swipeHint: {
    textAlign: 'center',
    color: '#999',
    marginTop: 15,
    marginBottom: 5,
  },
  noMoreCardsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: '60%',
    width: SCREEN_WIDTH - 40,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  noMoreCardsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StockSwipeScreen;
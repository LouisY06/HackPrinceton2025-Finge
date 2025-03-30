// layout.tsx (or app/_layout.tsx in Expo Router)
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import DeckFlashcards from './DeckFlashcards';
import PortfolioScreen from './PortfolioScreen';
import InsightsFlashcard from './InsightsFlashcard';
import WishListScreen from './WishListScreen';
import BottomNav from './BottomNav';
import CameraScanner from './CameraScanner';
import { WishItem } from './SwipeableWishCard';

export type TabName = 'home' | 'portfolio' | 'market' | 'wishlist' | 'camera';

// Type used by your swipeable deck cards
export interface CardData {
  key: string;
  companyName: string;
  subTitle: string;
  price?: string;
  priceChange?: string;
}

// Type for items stored in the wish list
export interface WishListItem {
  key: string;
  title: string;
  subtitle: string;
  price?: string;
  change?: string;
  readingText?: string;
}

// Type for portfolio items
export interface PortfolioItemType {
  key: string;
  title: string;
  subtitle: string;
  price: string;
  change: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [deckIndex, setDeckIndex] = useState(0);
  const [wishList, setWishList] = useState<WishItem[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItemType[]>([]);
  const [showInsights, setShowInsights] = useState(false);

  // Called when a deck card is swiped right (adds to wish list)
  const handleSwipeRight = (card: CardData) => {
    console.log("handleSwipeRight called with card:", card);
    
    const newWish: WishItem = {
      key: card.key + '-wish',
      title: card.companyName,
      subtitle: card.subTitle,
      price: card.price,
      change: card.priceChange,
      readingText: `${card.companyName} was added to your wish list.`,
    };
    
    console.log("Constructed newWish:", newWish);
    
    setWishList((prev) => {
      console.log("Previous wishList:", prev);
      if (!prev.find((item) => item.key === newWish.key)) {
        const updatedWishList = [...prev, newWish];
        console.log("Updated wishList:", updatedWishList);
        return updatedWishList;
      }
      console.log("WishList remains unchanged:", prev);
      return prev;
    });
  };
    
  // Called when a wish card is swiped left in the WishListScreen (remove wish)
  const handleRemoveWish = (key: string) => {
    setWishList((prev) => prev.filter((item) => item.key !== key));
  };

  // When a wish is marked in portfolio, add it to the portfolio and do NOT remove it from the wish list.
  // Also ensure that the same stock (by title) is not added twice.
  const handleMarkWish = (key: string) => {
    const wish = wishList.find((item) => item.key === key);
    if (wish) {
      const alreadyInPortfolio = portfolioItems.find(
        (portfolioItem) => portfolioItem.title === wish.title
      );
      if (!alreadyInPortfolio) {
        const newPortfolioItem: PortfolioItemType = {
          key: wish.key.replace('-wish', ''), // Optionally remove the suffix
          title: wish.title,
          subtitle: wish.subtitle,
          price: wish.price || '',
          change: wish.change || '',
        };
        setPortfolioItems((prev) => [...prev, newPortfolioItem]);
        console.log("Marked in portfolio:", newPortfolioItem);
      } else {
        console.log("Stock already in portfolio:", wish.title);
      }
    }
  };
  
  const renderContent = () => {
  switch (activeTab) {
    case 'home':
      return (
        <DeckFlashcards
          deckIndex={deckIndex}
          setDeckIndex={setDeckIndex}
          onSwipeRight={handleSwipeRight}
        />
      );
    case 'portfolio':
      if (showInsights) {
        return <InsightsFlashcard onCloseInsights={() => setShowInsights(false)} />;
      }
      return <PortfolioScreen
        portfolioItems={portfolioItems}
        onReadInsights={() => setShowInsights(true)}
      />;
    case 'wishlist':
      return <WishListScreen
        wishList={wishList}
        onRemoveWish={handleRemoveWish}
        onMarkWish={handleMarkWish}
      />;
    case 'market':
      return <CameraScanner />;
    case 'camera':
      return <CameraScanner />;
    default:
      return <CameraScanner />;
  }
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {renderContent()}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f0f0f0' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

// App.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import DeckFlashcards from './DeckFlashcards';
import PortfolioScreen from './PortfolioScreen';
import CameraScreen from './CameraScreen'; // This replaces PlaceholderScreen for the camera tab.
import WishListScreen from './WishListScreen';
import BottomNav from './BottomNav';

export type TabName = 'home' | 'portfolio' | 'market' | 'wishlist';

// This is the type used by your swipeable deck cards
export interface CardData {
  key: string;
  companyName: string;
  subTitle: string;
  price?: string;
  priceChange?: string;
}

// This is the type for items stored in the wish list
export interface WishListItem {
  key: string;
  title: string;
  subtitle: string;
  price?: string;
  change?: string;
  readingText?: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [deckIndex, setDeckIndex] = useState(0);
  const [wishList, setWishList] = useState<WishListItem[]>([]);

  // Called when a deck card is swiped right
  const handleSwipeRight = (card: CardData) => {
    const newWish: WishListItem = {
      key: card.key + '-wish',
      title: card.companyName,
      subtitle: card.subTitle,
      price: card.price,
      change: card.priceChange,
      readingText: `${card.companyName} was added to your wish list.`,
    };
    if (!wishList.find((item) => item.key === newWish.key)) {
      setWishList([...wishList, newWish]);
    }
  };

  // Called when a wish card is swiped left in the WishListScreen
  const handleRemoveWish = (key: string) => {
    setWishList(wishList.filter((item) => item.key !== key));
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
        return (
          <PortfolioScreen
            onReadInsights={() => {
              // Implement insights reading logic here
            }}
            onSwipeRight={(card) => {
              // Implement portfolio swipe logic here
            }}
          />
        );
      case 'market':
        // The market tab is now a Camera tab.
        return <CameraScreen />;
      case 'wishlist':
        return <WishListScreen wishList={wishList} onRemoveWish={handleRemoveWish} />;
      default:
        return <CameraScreen />;
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
  container: { flex: 1 },
});
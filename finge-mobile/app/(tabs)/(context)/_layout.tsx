// App.tsx (or app/_layout.tsx in Expo Router)
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import DeckFlashcards, { CardData } from './DeckFlashcards';
import PortfolioScreen from './PortfolioScreen';
import InsightsFlashcard from './InsightsFlashcard';
import WishListScreen from './WishListScreen';
import BottomNav from './BottomNav';
import CameraScanner from './CameraScanner';
import { WishItem } from './SwipeableWishCard';

type TabName = 'home' | 'portfolio' | 'market' | 'wishlist' | 'camera';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [deckIndex, setDeckIndex] = useState(0);
  const [wishList, setWishList] = useState<WishItem[]>([]);
  const [showInsights, setShowInsights] = useState(false);

  // Called when a deck card is swiped right
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
    
  // Called when a wish card is swiped left in the WishListScreen
  const handleRemoveWish = (key: string) => {
    setWishList(prev => prev.filter(item => item.key !== key));
  };

  // Portfolio item to CardData adapter
  const handlePortfolioSwipeRight = (item: { title: string; subtitle: string; price: string; change: string }) => {
    // Convert portfolio item to CardData format
    const cardData: CardData = {
      key: item.subtitle,
      companyName: item.title,
      subTitle: item.subtitle,
      price: item.price,
      priceChange: item.change
    };
    handleSwipeRight(cardData);
  };

  const renderContent = () => {
    if (activeTab === 'camera') {
      return <CameraScanner />;
    }    
    if (activeTab === 'home') {
      return <DeckFlashcards 
        deckIndex={deckIndex}
        setDeckIndex={setDeckIndex}
        onSwipeRight={handleSwipeRight}
      />;
    } else if (activeTab === 'portfolio') {
      if (showInsights) {
        return <InsightsFlashcard onCloseInsights={() => setShowInsights(false)} />;
      }
      return (
        <PortfolioScreen 
          onReadInsights={() => setShowInsights(true)}
          onSwipeRight={handlePortfolioSwipeRight}
        />
      );
    } else if (activeTab === 'wishlist') {
      return (
        <WishListScreen 
          wishList={wishList}
          onRemoveWish={handleRemoveWish}
        />
      );
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
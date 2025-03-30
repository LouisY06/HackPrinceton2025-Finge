// App.tsx (or app/_layout.tsx in Expo Router)
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import DeckFlashcards from '.';
import PortfolioScreen from './PortfolioScreen';
import InsightsFlashcard from './InsightsFlashcard';
import WishListScreen from './WishListScreen';
import PlaceholderScreen from './PlaceholderScreen';
import BottomNav from './BottomNav';
import CameraScanner from './CameraScanner';

type TabName = 'home' | 'portfolio' | 'market' | 'wishlist' | 'camera';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [showInsights, setShowInsights] = useState<boolean>(false);

  const renderContent = () => {
    if (activeTab === 'camera') {
      return <CameraScanner />; // Import this at the top
    }    
    if (activeTab === 'home') {
      return <DeckFlashcards />;
    } else if (activeTab === 'portfolio') {
      if (showInsights) {
        return <InsightsFlashcard onCloseInsights={() => setShowInsights(false)} />;
      }
      return <PortfolioScreen onReadInsights={() => setShowInsights(true)} />;
    } else if (activeTab === 'market') {
      return <PlaceholderScreen title="Market" />;
    } else if (activeTab === 'wishlist') {
      return <WishListScreen />;
    }
    return <PlaceholderScreen title="Unknown" />;
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
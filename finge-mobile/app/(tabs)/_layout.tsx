// App.tsx (or app/_layout.tsx in Expo Router)
import React, { useState } from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import DeckFlashcards from './(context)/';
import PortfolioScreen from './(context)/PortfolioScreen';
import InsightsFlashcard from './(context)/InsightsFlashcard';
import WishListScreen from './(context)/WishListScreen';
import PlaceholderScreen from './(context)/PlaceholderScreen';
import BottomNav from './(context)/BottomNav';

type TabName = 'home' | 'portfolio' | 'market' | 'wishlist';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [showInsights, setShowInsights] = useState<boolean>(false);

  const renderContent = () => {
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
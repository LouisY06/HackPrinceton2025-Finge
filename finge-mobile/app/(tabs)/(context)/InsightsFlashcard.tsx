// src/InsightsFlashcard.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INSIGHTS_DATA } from './data';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD_VERTICAL = 150;

interface InsightsFlashcardProps {
  onCloseInsights: () => void;
}

export default function InsightsFlashcard({ onCloseInsights }: InsightsFlashcardProps) {
  const [readingMode, setReadingMode] = useState<boolean>(false);
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
          resetCard();
          setReadingMode(true);
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

  const animatedStyle = {
    transform: [...position.getTranslateTransform(), { rotate }],
  };

  return (
    <View style={styles.insightsContainer}>
      <TouchableOpacity style={styles.insightsBackButton} onPress={onCloseInsights}>
        <Ionicons name="chevron-back" size={24} color="#444" />
      </TouchableOpacity>
      <Animated.View style={[styles.card, animatedStyle]} {...panResponder.panHandlers}>
        <ScrollView contentContainerStyle={styles.cardContentContainer}>
          {/* Apple Screen Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.companyName}>{INSIGHTS_DATA.companyName}</Text>
              <Text style={styles.ticker}>{INSIGHTS_DATA.subTitle}</Text>
            </View>
            <Ionicons name="star-outline" size={24} color="#888" />
          </View>
          {/* Stats Rows */}
          <View style={styles.statsRow}>
            {INSIGHTS_DATA.stats.map((stat, index) => (
              <View key={index} style={styles.statsBox}>
                <Text style={styles.statsTitle}>{stat.label}</Text>
                <Text style={styles.statsValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.statsRow}>
            {INSIGHTS_DATA.secondStats.map((stat, index) => (
              <View key={index} style={styles.statsBox}>
                <Text style={styles.statsTitle}>{stat.label}</Text>
                <Text style={styles.statsValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
          {/* Extra Financial Info */}
          <View style={styles.additionalStats}>
            {INSIGHTS_DATA.additionalStats.map((text, index) => (
              <Text key={index} style={styles.additionalStatText}>
                {text}
              </Text>
            ))}
          </View>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {INSIGHTS_DATA.tabs.map((tabName, index) => (
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
          {/* Content Blocks */}
          {INSIGHTS_DATA.contentCards.map((content, index) => (
            <View key={index} style={styles.contentBlock}>
              <View style={{ flex: 1 }}>
                <Text style={styles.contentTitle}>{content.title}</Text>
                {content.text ? (
                  <Text style={styles.contentText}>{content.text}</Text>
                ) : null}
              </View>
              {index === 0 && (
                <Image
                  source={{
                    uri: 'https://via.placeholder.com/80x80.png?text=iPhone+17',
                  }}
                  style={styles.contentImage}
                />
              )}
              {/* etc... */}
            </View>
          ))}
          <Text style={styles.swipeHint}>Swipe up for full article reading mode</Text>
        </ScrollView>
      </Animated.View>

      {readingMode && (
        <View style={styles.readingModeContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setReadingMode(false)}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.readingContentContainer}>
            <Text style={styles.articleTitle}>Apple Inc. Full Article</Text>
            <Text style={styles.articleContent}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </Text>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  insightsContainer: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  insightsBackButton: { position: 'absolute', top: 16, left: 16, zIndex: 99 },
  card: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
  },
  cardContentContainer: { padding: 20 },
  headerRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'center' },
  companyName: { fontSize: 22, fontWeight: '600' },
  ticker: { fontSize: 16, color: '#666', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statsBox: { alignItems: 'center', flex: 1 },
  statsTitle: { fontSize: 14, color: '#999' },
  statsValue: { fontSize: 16, fontWeight: '500', marginTop: 2 },
  additionalStats: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, marginBottom: 16 },
  additionalStatText: { fontSize: 14, color: '#444', marginVertical: 2 },
  tabsContainer: { flexDirection: 'row', marginBottom: 16 },
  tabButton: { paddingVertical: 8, paddingHorizontal: 12, marginRight: 8, borderRadius: 16, backgroundColor: '#eee' },
  tabActive: { backgroundColor: '#007AFF' },
  tabText: { fontSize: 14, color: '#444' },
  tabTextActive: { color: '#fff' },
  contentBlock: { flexDirection: 'row', backgroundColor: '#f8f8f8', padding: 12, borderRadius: 8, marginBottom: 16, alignItems: 'center' },
  contentTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  contentText: { fontSize: 14, lineHeight: 20, color: '#444' },
  contentImage: { width: 80, height: 80, borderRadius: 8, marginLeft: 12 },
  swipeHint: { textAlign: 'center', color: '#888', fontSize: 12, marginTop: 10 },
  readingModeContainer: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#fff', zIndex: 10,
  },
  closeButton: { alignSelf: 'flex-end', padding: 16 },
  closeButtonText: { fontSize: 20, fontWeight: 'bold' },
  readingContentContainer: { padding: 20, paddingBottom: 80 },
  articleTitle: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  articleContent: { fontSize: 16, lineHeight: 24, color: '#444' },
});
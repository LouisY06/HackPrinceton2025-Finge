// src/InsightsFlashcard.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TechStockInsight {
  companyName: string;
  ticker: string;
  ceo: string;
  stockPrice: string;
  change: string;
  marketCap: string;
  stats: { label: string; value: string }[];
  additionalStats: string[];
  content: string;
}

const insightsData: TechStockInsight[] = [
  {
    companyName: "Apple Inc.",
    ticker: "AAPL",
    ceo: "Tim Cook",
    stockPrice: "$150.00",
    change: "+2.50 (1.70%)",
    marketCap: "2.5T",
    stats: [
      { label: "P/E", value: "28.00" },
      { label: "Vol", value: "100M" },
      { label: "EPS", value: "5.00" },
    ],
    additionalStats: [
      "Profit Margin: 20%",
      "Operating Cash Flow: $80B",
    ],
    content: "Apple Inc. is renowned for its innovative products like the iPhone, iPad, and Mac. With a focus on design, ecosystem, and brand loyalty, Apple continues to dominate the tech industry.",
  },
  {
    companyName: "Microsoft Corp.",
    ticker: "MSFT",
    ceo: "Satya Nadella",
    stockPrice: "$300.00",
    change: "+5.00 (1.70%)",
    marketCap: "2.2T",
    stats: [
      { label: "P/E", value: "35.00" },
      { label: "Vol", value: "80M" },
      { label: "EPS", value: "6.00" },
    ],
    additionalStats: [
      "Profit Margin: 30%",
      "Operating Cash Flow: $60B",
    ],
    content: "Microsoft Corporation is a global leader in software, cloud computing, and enterprise services. Its robust growth is driven by a strong focus on innovation and cloud-based solutions.",
  },
  {
    companyName: "Amazon.com Inc.",
    ticker: "AMZN",
    ceo: "Andy Jassy",
    stockPrice: "$3500.00",
    change: "+25.00 (0.72%)",
    marketCap: "1.7T",
    stats: [
      { label: "P/E", value: "60.00" },
      { label: "Vol", value: "30M" },
      { label: "EPS", value: "3.50" },
    ],
    additionalStats: [
      "Profit Margin: 5%",
      "Operating Cash Flow: $25B",
    ],
    content: "Amazon.com Inc. is a global e-commerce and cloud computing powerhouse. Its innovative logistics network and growing cloud services have reshaped retail and technology worldwide.",
  },
];

export default function InsightsFlashcard({ onCloseInsights }: { onCloseInsights: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onCloseInsights}>
        <Ionicons name="chevron-back" size={24} color="#444" />
      </TouchableOpacity>
      <Text style={styles.pageTitle}>Tech Stocks Insights</Text>
      {insightsData.map((insight, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.companyName}>{insight.companyName}</Text>
              <Text style={styles.ticker}>{insight.ticker}</Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.detailText}>CEO: {insight.ceo}</Text>
              <Text style={styles.detailText}>Price: {insight.stockPrice}</Text>
              <Text style={styles.detailText}>Change: {insight.change}</Text>
              <Text style={styles.detailText}>Mkt Cap: {insight.marketCap}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            {insight.stats.map((stat, idx) => (
              <View key={idx} style={styles.statBox}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
          <View style={styles.additionalStats}>
            {insight.additionalStats.map((line, idx) => (
              <Text key={idx} style={styles.additionalStatText}>{line}</Text>
            ))}
          </View>
          <Text style={styles.contentText}>{insight.content}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  backButton: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    // Shadow for iOS and elevation for Android:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  ticker: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  infoColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  additionalStats: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginBottom: 12,
  },
  additionalStatText: {
    fontSize: 14,
    color: '#444',
  },
  contentText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
});

export { InsightsFlashcard };
import React, { useContext } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { PortfolioContext, Stock } from './PortfolioContext'; // Adjust the path as needed

export default function PortfolioScreen() {
  const { likedStocks } = useContext(PortfolioContext);

  if (likedStocks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No stocks liked yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={likedStocks}
      keyExtractor={(item: Stock) => item.id}
      renderItem={({ item }: { item: Stock }) => (
        <View style={styles.itemContainer}>
          <Image source={{ uri: item.logo }} style={styles.logo} />
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.symbol}>{item.symbol}</Text>
            <Text style={styles.price}>{item.price}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  info: {
    marginLeft: 15,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  symbol: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 16,
    color: '#333',
  },
});
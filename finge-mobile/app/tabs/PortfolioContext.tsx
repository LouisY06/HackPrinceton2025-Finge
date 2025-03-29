import React, { createContext, useState, ReactNode } from 'react';

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  logo: string;
  description: string;
  chart: string;
}

interface PortfolioContextProps {
  likedStocks: Stock[];
  addLikedStock: (stock: Stock) => void;
  removeLikedStock: (stock: Stock) => void;
}

export const PortfolioContext = createContext<PortfolioContextProps>({
  likedStocks: [],
  addLikedStock: () => {},
  removeLikedStock: () => {},
});

export const PortfolioProvider = ({ children }: { children: ReactNode }) => {
  const [likedStocks, setLikedStocks] = useState<Stock[]>([]);

  const addLikedStock = (stock: Stock) => {
    setLikedStocks(prev => {
      // Add only if not already added
      if (prev.find(s => s.id === stock.id)) {
        return prev;
      }
      return [...prev, stock];
    });
  };

  const removeLikedStock = (stock: Stock) => {
    setLikedStocks(prev => prev.filter(s => s.id !== stock.id));
  };

  return (
    <PortfolioContext.Provider value={{ likedStocks, addLikedStock, removeLikedStock }}>
      {children}
    </PortfolioContext.Provider>
  );
};
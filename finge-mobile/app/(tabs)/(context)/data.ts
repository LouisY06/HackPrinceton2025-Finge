// src/data.ts

// Interface for a deck card (used in Home/DeckFlashcards)
export interface DeckCard {
    key: string;
    companyName: string;
    subTitle?: string;
    price?: string;
    priceChange?: string;
    stats?: { label: string; value: string }[];
    additionalStats?: string[];
    tabs?: string[];
    contentCards?: { title: string; text: string }[];
  }
  
  export const DECK_CARDS: DeckCard[] = [
    {
      key: 'nvidia',
      companyName: 'Nvidia Corp.',
      subTitle: 'NVDA',
      price: '105.97',
      priceChange: '+1.22 (1.16%)',
      stats: [
        { label: 'Vol', value: '827.5M' },
        { label: 'P/E', value: '37.50' },
        { label: 'Mkt Cap', value: '2.95T' },
      ],
      additionalStats: [
        'Profit Margin: 55.13%',
        'Operating Cash Flow: 64.03 B',
        'Levered Free Cash Flow: 53.13 B',
      ],
      tabs: ['All', 'Geopolitics', 'Product Releases'],
      contentCards: [
        {
          title: 'Nvidia Briefs',
          text: "Nvidia's Challenge to China. Chip making and global rivalry continue to shape the semiconductor landscape.",
        },
        {
          title: 'Industry Leadership',
          text: 'Known for its leadership in GPUs and AI, Nvidia is expanding into data centers, autonomous vehicles, and diversified strategies.',
        },
      ],
    },
    // ... add additional deck cards here ...
  ];
  
  
  // Interface for Insights data (used in InsightsFlashcard)
  export interface InsightsData {
    key: string;
    companyName: string;
    subTitle: string;
    stats: { label: string; value: string }[];
    secondStats: { label: string; value: string }[];
    additionalStats: string[];
    tabs: string[];
    contentCards: { title: string; text: string }[];
  }
  
  export const INSIGHTS_DATA: InsightsData = {
    key: 'apple',
    companyName: 'Apple Inc.',
    subTitle: 'AAPL',
    stats: [
      { label: 'Vol', value: '55.53 M' },
      { label: 'Yield', value: '0.46%' },
      { label: 'Beta', value: '1.18' },
    ],
    secondStats: [
      { label: 'Mkt Cap', value: '2.97 T' },
      { label: 'EPS', value: '6.30' },
    ],
    additionalStats: [
      'Profit Margin: 25%',
      'Operating Cash Flow: 105 B',
      'Levered Free Cash Flow: 64 B',
    ],
    tabs: ['All', 'Taxes', 'Product Releases'],
    contentCards: [
      {
        title: 'Apple releases a first peek of iPhone 17',
        text: 'Can it beat the concerns of Apple losing innovation?',
      },
      {
        title: 'Caught between Trump and the EU',
        text: 'How much can they fine Apple and Meta?',
      },
      {
        title: 'Apple invests in new all‑glass Apple watch',
        text: '',
      },
      {
        title: 'Portfolio Notes:',
        text: `Apple enjoys 35% of the portfolio. Expected new iPhone in April 2024; Apple remains a major driver of risk/return.`,
      },
    ],
  };
  
  
  // Interface for a wish list item (used in WishListScreen)
  export interface WishItem {
    key: string;
    name: string;
    subTitle: string;
    vol: string;
    pe: string;
    mktCap: string;
    yield: string;
    beta: string;
    eps: string;
    readingText: string;
  }
  
  export const WISH_LIST: WishItem[] = [
    {
      key: 'wishlist-nvidia',
      name: 'Nvidia Corp.',
      subTitle: 'NVDA',
      vol: '237.5 M',
      pe: '37.50',
      mktCap: '2.69 T',
      yield: '0.04%',
      beta: '1.28',
      eps: '3.94',
      readingText: `Nvidia is on your wish list. Monitor its share price and decide if you want to add it to your portfolio. Keep an eye on GPU demand, AI developments, and global competition.`,
    },
    // ... add additional wish list items here ...
  ];
import random
import numpy as np

# --- Helper Function: Cosine Similarity ---
def cosine_similarity(vec1, vec2):
    """Compute the cosine similarity between two vectors."""
    vec1, vec2 = np.array(vec1), np.array(vec2)
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

# --- Sample Stock Data ---
# Each stock is represented as a dictionary.
stocks = [
    {"ticker": "", "popularity": 0.9, "industry": "Tech", "features": [1.0, 0.5, 0.3]},
    {"ticker": "GOOGL", "popularity": 0.85, "industry": "Tech", "features": [1.0, 0.6, 0.2]},
    {"ticker": "TSLA", "popularity": 0.95, "industry": "Automotive", "features": [0.7, 0.2, 1.0]},
    {"ticker": "AMZN", "popularity": 0.8, "industry": "Retail", "features": [0.9, 0.4, 0.5]},
    # Add more stocks as needed...
]

# --- Multi-Armed Bandit Selection Function ---
def select_stock(user_profile, stocks, epsilon=0.1):
    """
    Select a stock based on an epsilon-greedy multi-armed bandit approach.
    
    Exploration (random selection) encourages diversification,
    while exploitation chooses stocks similar to the user's preferences.
    
    Parameters:
        user_profile (dict): Contains user's preferred industry and feature vector.
        stocks (list): List of stock dictionaries.
        epsilon (float): Exploration rate.
    
    Returns:
        dict: The selected stock.
    """
    # Decide whether to explore or exploit
    if random.random() < epsilon:
        # Exploration: select a random stock (diversification)
        return random.choice(stocks)
    else:
        # Exploitation: filter stocks by the user's preferred industry (if set)
        preferred_industry = user_profile.get("preferred_industry", None)
        filtered_stocks = [stock for stock in stocks if stock["industry"] == preferred_industry] \
                          if preferred_industry else stocks
        if not filtered_stocks:  # Fallback if no stocks match the preferred industry
            filtered_stocks = stocks
        
        # Compute a combined score (popularity and similarity)
        user_features = user_profile.get("features", None)
        best_score = -np.inf
        best_stock = None
        for stock in filtered_stocks:
            # Calculate similarity if user feature vector is available; otherwise, set to 0.
            sim = cosine_similarity(user_features, stock["features"]) if user_features else 0
            # Weighted score: adjust weights as needed (here, 50% popularity, 50% similarity)
            score = 0.5 * stock["popularity"] + 0.5 * sim
            if score > best_score:
                best_score = score
                best_stock = stock
        return best_stock

# --- Example User Profile ---
# This profile could be updated in real-time based on swipes.
user_profile = {
    "preferred_industry": "Tech",   # Derived from positive user interactions
    "features": [1.0, 0.55, 0.25]     # Aggregated user preference vector (example)
}

# --- Get a Recommendation ---
recommended_stock = select_stock(user_profile, stocks, epsilon=0.2)
print("Recommended stock:", recommended_stock["ticker"])

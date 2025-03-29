import yfinance as yf
import matplotlib.pyplot as plt

# Define the ticker symbol
ticker_symbol = 'AAPL'

# Create a ticker object
ticker_data = yf.Ticker(ticker_symbol)

# Get historical market data for a specific period
# Here we fetch data from January 1, 2020 to January 1, 2021
ticker_df = ticker_data.history(period='1d', start='2020-01-01', end='2021-01-01')

# Print the first few rows of data
print(ticker_df.head())

# Plot the closing prices over time
plt.figure(figsize=(10, 6))
plt.plot(ticker_df.index, ticker_df['Close'], label='Close Price')
plt.title(f'{ticker_symbol} Closing Prices')
plt.xlabel('Date')
plt.ylabel('Price (USD)')
plt.legend()
plt.show()

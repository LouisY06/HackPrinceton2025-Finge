import requests
import os
from dotenv import load_dotenv

load_dotenv()
ALPHA_API_KEY = os.getenv("ALPHA_API_KEY")
url = f'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey={ALPHA_API_KEY}'

r = requests.get(url)
data = r.json()

print(data)

import pandas as pd
import matplotlib.pyplot as plt

time_series = data["Time Series (5min)"]
df = pd.DataFrame(time_series).T
df.columns = ["open", "high", "low", "close", "volume"]
df = df.astype(float)
df.index = pd.to_datetime(df.index)
df.sort_index(inplace=True)
plt.figure(figsize=(10, 6))
plt.plot(df.index, df["close"])
plt.title("IBM Intraday Closing Prices")
plt.xlabel("Time")
plt.ylabel("Price (USD)")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

import pandas as pd


import os
print("Current working directory:", os.getcwd())

df = pd.read_csv("stock_ticker.csv")

tickers_list = df["Symbol"].tolist()

print(tickers_list)


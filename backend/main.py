from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()

# Enable CORS (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




def transform_stock_to_deckcard(ticker: str) -> dict:
    # Use yfinance to fetch stock data
    stock = yf.Ticker(ticker)
    info = stock.info

    # Check required field; if missing, raise an error
    if "regularMarketPrice" not in info:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found or no data available.")

    # Build a DeckCard-format dictionary.
    deck_card = {
        "key": info.get("symbol", None),
        "companyName": info.get("shortName", info.get("longName", None)),
        "subTitle": info.get("symbol", None),
        "price": str(info.get("regularMarketPrice", "None")),
        # Combine change and change percent for display.
        "priceChange": f"{info.get('regularMarketChange', 'None')} ({info.get('regularMarketChangePercent', 'None')}%)",
        "stats": [
            { "label": "Vol", "value": str(info.get("regularMarketVolume", "None")) },
            { "label": "P/E", "value": str(info.get("trailingPE", "None")) },
            { "label": "Mkt Cap", "value": str(info.get("marketCap", "None")) },
        ],
        "additionalStats": [],
        "tabs": ["All", "Details"],
        "contentCards": [
            { "title": "About", "text": info.get("longBusinessSummary", "None") },
            { "title": "Chart", "text": "Chart placeholder" },
        ],
    }
    return deck_card

'''
# image -> ticker
# POST ticker database
# gets all the tickers for the database
'''

#TAKES IN A TICKER, RETURNS INFO
@app.get("/stock/{ticker}")
async def get_stock(ticker: str):
    try:
        deck_card = transform_stock_to_deckcard(ticker)
        return deck_card
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# To run: uvicorn main:app --reload

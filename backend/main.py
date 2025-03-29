from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()

# Allow all origins (for development); adjust for production as needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/stock/{ticker}")
async def get_stock(ticker: str):
    try:
        # Create a ticker object using yfinance
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Check if the ticker data is valid by verifying key fields
        if "regularMarketPrice" not in info:
            raise HTTPException(status_code=404, detail="Ticker not found or no data available.")
        
        # Prepare a mobile-friendly metadata dictionary
        metadata = {
            "ticker": info.get("symbol", ""),
            "name": info.get("shortName", ""),
            "sector": info.get("sector", ""),
            "industry": info.get("industry", ""),
            "marketCap": info.get("marketCap", 0),
            "currentPrice": info.get("regularMarketPrice", 0),
            "previousClose": info.get("regularMarketPreviousClose", 0),
            "open": info.get("regularMarketOpen", 0),
            "dayLow": info.get("regularMarketDayLow", 0),
            "dayHigh": info.get("regularMarketDayHigh", 0),
            "volume": info.get("regularMarketVolume", 0),
        }
        
        # Fetch historical data for the last 5 days
        hist = stock.history(period="5d")
        # Keep only key columns
        hist = hist[['Open', 'High', 'Low', 'Close', 'Volume']]
        # Convert index (dates) to string for JSON serialization
        historical = {str(date): data.to_dict() for date, data in hist.iterrows()}
        
        return {"metadata": metadata, "historical": historical}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# To run the backend, use:
# uvicorn filename:app --reload

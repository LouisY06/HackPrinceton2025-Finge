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
    import yfinance as yf
    from fastapi import HTTPException

    stock = yf.Ticker(ticker)
    info = stock.info

    if "regularMarketPrice" not in info:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found or no data available.")

    # Format profit margin (if provided as a fraction)
    profit_margin = f"{info.get('profitMargins', 0) * 100:.2f}%" if info.get("profitMargins") is not None else "N/A"

    # Format operating cash flow (assume raw number, convert to billions)
    operating_cash_flow = info.get("operatingCashflow")
    operating_cash_flow_str = f"{operating_cash_flow / 1e9:.2f} B" if operating_cash_flow is not None else "N/A"

    # Format free cash flow using freeCashflow field
    free_cashflow = info.get("freeCashflow")
    free_cashflow_str = f"{free_cashflow / 1e9:.2f} B" if free_cashflow is not None else "N/A"

    # Extract sentences from longBusinessSummary.
    long_summary = info.get("longBusinessSummary", "")
    # Split by period and filter out any empty sentences.
    sentences = [s.strip() for s in long_summary.split('.') if s.strip()]
    
    # First content card: first two sentences.
    if len(sentences) >= 2:
        first_card_text = ". ".join(sentences[:2]) + "."
    elif sentences:
        first_card_text = sentences[0] + "."
    else:
        first_card_text = "No summary available."
    
    # Second content card: third sentence if exists.
    second_card_text = sentences[2] + "." if len(sentences) >= 3 else "No additional summary available."

    # Use the stock name for content card titles.
    stock_name = info.get("shortName", info.get("longName", "Stock"))

    deck_card = {
        "key": info.get("symbol"),
        "companyName": stock_name,
        "subTitle": info.get("symbol"),
        "price": str(info.get("regularMarketPrice", "None")),
        "priceChange": f"{info.get('regularMarketChange', 'None')} ({info.get('regularMarketChangePercent', 'None')}%)",
        "stats": [
            {"label": "Vol", "value": str(info.get("regularMarketVolume", "None"))},
            {"label": "P/E", "value": str(info.get("trailingPE", "None"))},
            {"label": "Mkt Cap", "value": str(info.get("marketCap", "None"))},
        ],
        "additionalStats": [
            f"Profit Margin: {profit_margin}",
            f"Operating Cash Flow: {operating_cash_flow_str}",
            f"Free Cash Flow: {free_cashflow_str}",
        ],
        "tabs": ["All", "Details"],
        "contentCards": [
            {"title": stock_name, "text": first_card_text},
            {"title": stock_name, "text": second_card_text},
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

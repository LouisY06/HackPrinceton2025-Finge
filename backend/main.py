from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from pydantic import BaseModel
from pymongo import MongoClient
import requests
from openai import OpenAI
from dotenv import load_dotenv
import os
import pandas as pd
from fastapi import UploadFile, File
from fastapi.responses import JSONResponse
import base64
from bson import ObjectId
from fastapi.staticfiles import StaticFiles
import uuid

# Load environment variables
load_dotenv()
CLOUD_NAME = os.getenv("CLOUD_NAME")  # e.g. 'demo'
CLOUDINARY_UPLOAD_PRESET = os.getenv("CLOUDINARY_UPLOAD_PRESET") or "unsigned_preset"

# MongoDB connection
mongo_client = MongoClient(os.getenv("MONGODB_URI"))
db = mongo_client["HackPrinceton"]
images_collection = db["FingeDB"]

# Lunon/OpenAI setup
lunon_client = OpenAI(
    api_key=os.getenv("LUNON_API_KEY"),
    base_url="https://api.lunon.com/v1"
)

# Create FastAPI instanceimport pandas as pd
import random
import os 
app = FastAPI()

# Enable CORS as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df = pd.read_csv("../stock_ticker.csv")
tickers_list = df["Symbol"].tolist()
print("Tickers loaded:", tickers_list)
####################
# Helper Functions #
####################

def analyze_image_and_get_ticker(image_url: str) -> str:
    prompt = ("Identify the brand in this image and return only the associated "
              "stock ticker symbol. If it is not publicly traded, return 'NULL'.")

    response = lunon_client.chat.completions.create(
        model="Default",
        messages=[{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]
        }]
    )

    ticker = response.choices[0].message.content.strip().upper()
    if ticker == "NULL" or not ticker.isalnum():
        return None
    return ticker

def transform_stock_to_deckcard(ticker: str) -> dict:
    import yfinance as yf
    from fastapi import HTTPException

    stock = yf.Ticker(ticker)
    info = stock.info

    if "regularMarketPrice" not in info:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found or no data available.")

    # Prepare extra stats
    profit_margin = f"{info.get('profitMargins', 0) * 100:.2f}%" if info.get('profitMargins') else "N/A"
    operating_cash_flow = info.get('operatingCashflow')
    operating_cash_flow_str = f"{operating_cash_flow / 1e9:.2f} B" if operating_cash_flow else "N/A"
    free_cashflow = info.get('freeCashflow')
    free_cashflow_str = f"{free_cashflow / 1e9:.2f} B" if free_cashflow else "N/A"

    # Summaries
    long_summary = info.get("longBusinessSummary", "")
    sentences = [s.strip() for s in long_summary.split('.') if s.strip()]

    if len(sentences) >= 2:
        first_card_text = ". ".join(sentences[:2]) + "."
    elif sentences:
        first_card_text = sentences[0] + "."
    else:
        first_card_text = "No summary available."

    second_card_text = sentences[2] + "." if len(sentences) >= 3 else "No additional summary available."

    stock_name = info.get("shortName", info.get("longName", "Stock"))

    # Combine everything into ONE dictionary
    deck_card = {
        "key": info.get("symbol"),
        "companyName": stock_name,
        "subTitle": info.get("symbol"),
        "price": str(info.get("regularMarketPrice", "None")),
        "priceChange": f"{info.get('regularMarketChange', 'None')} ({info.get('regularMarketChangePercent', 'None')}%)",
        "stats": [
            {"label": "Vol",     "value": str(info.get("regularMarketVolume", "None"))},
            {"label": "P/E",     "value": str(info.get("trailingPE", "None"))},
            {"label": "Mkt Cap", "value": str(info.get("marketCap", "None"))},
        ],
        "additionalStats": [
            f"Profit Margin: {profit_margin}",
            f"Operating Cash Flow: {operating_cash_flow_str}",
            f"Free Cash Flow: {free_cashflow_str}",
        ],
        "tabs": ["All", "Details"],
        "contentCards": [
            {
                "title": f"About {stock_name}",
                "text": first_card_text
            },
            {
                "title": "More Info",
                "text": second_card_text
            }
        ],
    }

    return deck_card

def get_stock_snapshot(ticker: str) -> dict:
    """Fetches stock snapshot from Nasdaq API."""
    url = f'https://api.nasdaq.com/api/quote/{ticker}/info'
    headers = {'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0'}
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json()
        return {"error": f"Failed to fetch data: {response.status_code}", "reason": response.text}
    except requests.exceptions.Timeout:
        return {"error": "Request timed out"}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def extract_useful_stock_data(stock_snapshot: dict) -> dict:
    """Parses Nasdaq's JSON to extract relevant fields."""
    if 'data' not in stock_snapshot or not stock_snapshot['data']:
        return None

    data = stock_snapshot['data']
    return {
        "symbol":         data.get('symbol', 'N/A'),
        "companyName":    data.get('companyName', 'N/A'),
        "exchange":       data.get('exchange', 'N/A'),
        "lastSalePrice":  data['primaryData'].get('lastSalePrice', 'N/A'),
        "netChange":      data['primaryData'].get('netChange', 'N/A'),
        "percentageChange": data['primaryData'].get('percentageChange', 'N/A'),
        "volume":         data['primaryData'].get('volume', 'N/A'),
        "marketStatus":   data.get('marketStatus', 'N/A'),
        "lastTradeDate":  data['primaryData'].get('lastTradeTimestamp', 'N/A'),
        "fiftyTwoWeekRange": data['keyStats']['fiftyTwoWeekHighLow'].get('value', 'N/A')
    }

#############################
# Upload Image to Cloudinary
#############################
@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Receives an image from the user, uploads to Cloudinary, analyses via OpenAI, returns stock data."""
    try:
        # 1) read file bytes
        file_bytes = await file.read()

        # 2) post to Cloudinary
        cloud_url = f"https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload"
        data = {"upload_preset": CLOUDINARY_UPLOAD_PRESET}
        files = {"file": ("temp.jpg", file_bytes, "image/jpeg")}

        print("Uploading to Cloudinary...")
        resp = requests.post(cloud_url, data=data, files=files)
        cloud_resp = resp.json()
        if resp.status_code != 200 or "secure_url" not in cloud_resp:
            raise Exception(f"Cloudinary upload failed: {cloud_resp}")
        
        image_url = cloud_resp["secure_url"]
        print("Image URL:", image_url)

        # 3) analyze with OpenAI (Lunon)
        ticker = analyze_image_and_get_ticker(image_url)
        print("Ticker:", ticker)
        if not ticker:
            return JSONResponse(status_code=404, content={"error": "Could not extract ticker from image."})

        # 4) fetch yFinance + Nasdaq data
        yahoo_data = transform_stock_to_deckcard(ticker)
        nasdaq_snap = get_stock_snapshot(ticker)
        nasdaq_data = extract_useful_stock_data(nasdaq_snap)

        # 5) Optionally store info in MongoDB
        images_collection.insert_one({"image_url": image_url, "ticker": ticker})

        # 6) Return all data to client
        return {
            "ticker":       ticker,
            "yahooFinance": yahoo_data,
            "nasdaq":       nasdaq_data,
            "cloudinaryUrl": image_url
        }

    except Exception as e:
        print("Error:", e)
        return JSONResponse(status_code=500, content={"error": str(e)})

##########################################
# if you still want image-to-stock route #
##########################################
class ImageRequest(BaseModel):
    image_url: str

@app.post("/image-to-stock")
async def image_to_stock(request: ImageRequest):
    """If user or other service provides a direct public image_url, do the same analysis flow."""
    image_url = request.image_url
    images_collection.insert_one({"image_url": image_url})

    # analyze
    ticker = analyze_image_and_get_ticker(image_url)
    if not ticker:
        raise HTTPException(status_code=404, detail="Brand not publicly traded or ticker not found.")

    # fetch stock data
    try:
        yahoo_data = transform_stock_to_deckcard(ticker)
    except Exception as e:
        yahoo_data = {"error": str(e)}

    nasdaq_snap = get_stock_snapshot(ticker)
    nasdaq_data = extract_useful_stock_data(nasdaq_snap)

    return {
        "ticker": ticker,
        "yahooFinance": yahoo_data,
        "nasdaq": nasdaq_data,
        "imageStored": True
    }

#####################
# Additional routes #
#####################
@app.get("/stock/{ticker}")
async def get_stock(ticker: str):
    try:
        return transform_stock_to_deckcard(ticker)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# To run: uvicorn main:app --reload

@app.get("/stock_recommendation")
async def stock_recommendation():
    max_attempts = 100
    for _ in range(max_attempts):
        ticker = random.choice(tickers_list)
        stock = yf.Ticker(ticker)
        info = stock.info
        # Check that the stock has a regularMarketPrice (a sign it exists on yfinance)
        if info.get("regularMarketPrice") is not None:
            return {"ticker": ticker}
    raise HTTPException(status_code=404, detail="No valid ticker found after several attempts.")

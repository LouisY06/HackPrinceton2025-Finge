from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from pydantic import BaseModel
from pymongo import MongoClient
import requests
from openai import OpenAI
from dotenv import load_dotenv
import os

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

# Create FastAPI instance
app = FastAPI()

# Enable CORS as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    """Fetches stock data from Yahoo (via yfinance) and shapes it into a DeckCard format."""
    stock = yf.Ticker(ticker)
    info = stock.info

    if "regularMarketPrice" not in info:
        raise HTTPException(status_code=404, detail=f"Ticker {ticker} not found or no data available.")

    return {
        "key": info.get("symbol"),
        "companyName": info.get("shortName", info.get("longName")),
        "subTitle": info.get("symbol"),
        "price": str(info.get("regularMarketPrice", "None")),
        "priceChange": f"{info.get('regularMarketChange', 'None')} ({info.get('regularMarketChangePercent', 'None')}%)",
        "stats": [
            {"label": "Vol",     "value": str(info.get("regularMarketVolume", "None"))},
            {"label": "P/E",     "value": str(info.get("trailingPE", "None"))},
            {"label": "Mkt Cap", "value": str(info.get("marketCap", "None"))},
        ],
        "additionalStats": [],
        "tabs": ["All", "Details"],
        "contentCards": [
            {"title": "About", "text": info.get("longBusinessSummary", "None")},
            {"title": "Chart", "text": "Chart placeholder"},
        ],
    }

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


# Launch command:
# uvicorn main:app --host 0.0.0.0 --reload

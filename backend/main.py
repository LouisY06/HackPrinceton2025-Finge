from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from pydantic import BaseModel
from pymongo import MongoClient
import requests
from openai import OpenAI
from dotenv import load_dotenv
import os

from fastapi import UploadFile, File, APIRouter
from fastapi.responses import JSONResponse
import shutil
import uuid
import os

import base64
from bson import ObjectId

load_dotenv()

# MongoDB Connection
mongo_client = MongoClient(os.getenv("MONGODB_URI"))
# Select your database ("HackPrinceton") from MongoDB
db = mongo_client["HackPrinceton"]
# Select (or create) your collection ("FingeDB") from your database
images_collection = db["FingeDB"]

# Lunon/OpenAI setup
lunon_client = OpenAI(
    api_key=os.getenv("LUNON_API_KEY"),
    base_url="https://api.lunon.com/v1"
)
app = FastAPI()


@app.post("/save-image")
async def save_image(file: UploadFile = File(...)):
    try:
        # Read and encode image
        image_bytes = await file.read()
        image_base64 = base64.b64encode(image_bytes).decode("utf-8")

        # Save to MongoDB
        result = images_collection.insert_one({
            "image_data": image_base64,
            "filename": file.filename
        })

        # Return the inserted document's ID
        return {"image_id": str(result.inserted_id)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

# Enable CORS (adjust as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ImageRequest(BaseModel):
    image_url: str


# Reuse functions from your existing scripts here (shortened for clarity)
def analyze_image_and_get_ticker(image_url):
    prompt = ("Identify the brand in this image and return only the associated "
              "stock ticker symbol. If it is not publicly traded, return 'NULL'.")

    response = lunon_client.chat.completions.create(
        model="Default",
        messages=[{"role": "user", "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": image_url}}
        ]}]
    )

    ticker = response.choices[0].message.content.strip().upper()

    if ticker == "NULL" or not ticker.isalnum():
        return None

    return ticker

def get_stock_snapshot(ticker):
    url = f'https://api.nasdaq.com/api/quote/{ticker}/info'

    headers = {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
    }

    params = {
        'assetclass': 'stocks'
    }

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)

        if response.status_code == 200:
            return response.json()
        else:
            return {
                "error": f"Failed to fetch data: {response.status_code}",
                "reason": response.text
            }
    except requests.exceptions.Timeout:
        return {"error": "Request timed out"}
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

def extract_useful_stock_data(stock_snapshot):
    if 'data' not in stock_snapshot or not stock_snapshot['data']:
        return None

    data = stock_snapshot['data']

    extracted = {
        "symbol": data.get('symbol', 'N/A'),
        "companyName": data.get('companyName', 'N/A'),
        "exchange": data.get('exchange', 'N/A'),
        "lastSalePrice": data['primaryData'].get('lastSalePrice', 'N/A'),
        "netChange": data['primaryData'].get('netChange', 'N/A'),
        "percentageChange": data['primaryData'].get('percentageChange', 'N/A'),
        "volume": data['primaryData'].get('volume', 'N/A'),
        "marketStatus": data.get('marketStatus', 'N/A'),
        "lastTradeDate": data['primaryData'].get('lastTradeTimestamp', 'N/A'),
        "fiftyTwoWeekRange": data['keyStats']['fiftyTwoWeekHighLow'].get('value', 'N/A')
    }

    return extracted


UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    # Save uploaded file locally
    filename = f"{uuid.uuid4()}.jpg"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Convert local path to file:// URL (or serve via static files if needed)
    image_url = f"file://{os.path.abspath(file_path)}"

    # Use your existing analysis function
    try:
        ticker = analyze_image_and_get_ticker(image_url)
        if not ticker:
            return JSONResponse(status_code=404, content={"error": "Could not extract ticker."})

        yahoo = transform_stock_to_deckcard(ticker)
        nasdaq_snapshot = get_stock_snapshot(ticker)
        nasdaq = extract_useful_stock_data(nasdaq_snapshot)

        # Store to MongoDB
        images_collection.insert_one({"image_path": file_path, "ticker": ticker})

        return {
            "ticker": ticker,
            "yahooFinance": yahoo,
            "nasdaq": nasdaq,
            "localPath": file_path,
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.get("/analyze-latest")
async def analyze_latest():
    # Get the most recent image
    doc = images_collection.find_one(sort=[("_id", -1)])
    if not doc or "image_data" not in doc:
        return JSONResponse(status_code=404, content={"error": "No image found."})

    # Decode base64
    image_bytes = base64.b64decode(doc["image_data"])

    # OPTIONAL: save temporarily if your AI tool needs a file path
    with open("temp.jpg", "wb") as f:
        f.write(image_bytes)

    # Use local path for analysis
    try:
        ticker = analyze_image_and_get_ticker("temp.jpg")
        yahoo = transform_stock_to_deckcard(ticker)
        nasdaq = extract_useful_stock_data(get_stock_snapshot(ticker))
        
        return {
            "ticker": ticker,
            "yahooFinance": yahoo,
            "nasdaq": nasdaq
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# Endpoint to handle image upload and return combined Nasdaq and Yahoo Finance data
@app.post("/image-to-stock")
async def image_to_stock(request: ImageRequest):
    image_url = request.image_url

    # Step 1: Store image URL in MongoDB
    image_doc = {"image_url": image_url}
    images_collection.insert_one(image_doc)

    # Step 2: Identify ticker from image
    ticker = analyze_image_and_get_ticker(image_url)
    if not ticker:
        raise HTTPException(status_code=404, detail="Brand not publicly traded or could not identify ticker.")

    # Step 3: Get Yahoo Finance data
    try:
        yahoo_data = transform_stock_to_deckcard(ticker)
    except Exception as e:
        yahoo_data = {"error": str(e)}

    # Step 4: Get Nasdaq Data
    nasdaq_url = f'https://api.nasdaq.com/api/quote/{ticker}/info'
    headers = {'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0'}

    nasdaq_response = requests.get(nasdaq_url, headers=headers)
    if nasdaq_response.status_code == 200:
        nasdaq_json = nasdaq_response.json()
        nasdaq_data = extract_useful_stock_data(nasdaq_json)
    else:
        nasdaq_data = {"error": f"Failed to fetch Nasdaq data: {nasdaq_response.status_code}"}

    # Combine data into structured response
    combined_response = {
        "ticker": ticker,
        "yahooFinance": yahoo_data,
        "nasdaq": nasdaq_data,
        "imageStored": True
    }

    return combined_response





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

# To run: uvicorn main:app --host 0.0.0.0 --reload

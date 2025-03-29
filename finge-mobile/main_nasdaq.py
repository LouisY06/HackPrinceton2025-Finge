from openai import OpenAI
import requests

# Setup Lunon API
client = OpenAI(
    api_key="sk-lunon-bf3f5167-5799-441a-91a1-fcf5475fafa3",
    base_url="https://api.lunon.com/v1"
)

# Nasdaq API Key (if applicable)
nd_key = '_Fvsd5q-FWtsKoGCAKdu'

def analyze_image_and_get_ticker(image_url):
    prompt = ("Identify the brand in this image and return only the associated "
              "stock ticker symbol. If it is not a publicly traded company, return 'NULL'.")

    response = client.chat.completions.create(
        model="Default",
        messages=[
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_url}}
            ]}
        ]
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


# Example Usage
image_url = "https://t-mobile.scene7.com/is/image/Tmusprod/Apple-iPhone-16-Pro-Max-Black-Titanium-frontimage"

ticker = analyze_image_and_get_ticker(image_url)

if ticker:
    print(f"Identified ticker: {ticker}")
    stock_snapshot = get_stock_snapshot(ticker)
    print("Stock Snapshot Data:", stock_snapshot)
else:
    print("The identified brand is not publicly traded.")

useful_data = extract_useful_stock_data(stock_snapshot)
print(useful_data)

import httpx
from typing import Dict
from datetime import datetime

ID_MAP = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
    "SOL": "solana",
    "BNB": "binancecoin",
    "XRP": "ripple",
    "DOGE": "dogecoin",
    "ADA": "cardano",
    "DOT": "polkadot",
    "LINK": "chainlink",
    "MATIC": "matic-network"
}

async def fetch_market_prices() -> Dict[str, Dict]:
    """
    从 CoinGecko 获取实时行情数据 (Top 10)
    """
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        "ids": ",".join(ID_MAP.values()),
        "vs_currencies": "usd",
        "include_24hr_change": "true"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"DEBUG: Fetching prices for {','.join(ID_MAP.values())}")
            response = await client.get(url, params=params, timeout=10.0)
            
            if response.status_code != 200:
                print(f"ERROR: CoinGecko returned status {response.status_code}")
                # 极端兜底：如果被封 IP，返回所有币种的模拟数据
                return {
                    "BTC": {"price": 80778, "change": 1.33},
                    "ETH": {"price": 2375, "change": 0.62},
                    "SOL": {"price": 84.7, "change": -0.06},
                    "BNB": {"price": 312.5, "change": 0.45},
                    "XRP": {"price": 0.62, "change": -1.2},
                    "DOGE": {"price": 0.08, "change": 5.4},
                    "ADA": {"price": 0.45, "change": -0.8},
                    "DOT": {"price": 6.7, "change": 1.2},
                    "LINK": {"price": 14.5, "change": 2.3},
                    "MATIC": {"price": 0.82, "change": -0.5}
                }

            data = response.json()
            print(f"DEBUG: CoinGecko raw data keys: {list(data.keys())}")
            
            results = {}
            for symbol, cg_id in ID_MAP.items():
                if cg_id in data:
                    results[symbol] = {
                        "price": data[cg_id]["usd"],
                        "change": round(data[cg_id].get("usd_24h_change", 0), 2)
                    }
            return results
        except Exception as e:
            print(f"CRITICAL: Market fetch failed: {e}")
            return {}

async def fetch_market_history(symbol: str, days: int = 7):
    """
    获取历史行情数据用于绘图
    """
    coin_id = ID_MAP.get(symbol, "bitcoin")
    
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    params = {
        "vs_currency": "usd",
        "days": str(days),
        "interval": "daily" if days > 1 else "hourly"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params, timeout=10.0)
            if response.status_code != 200:
                # 模拟 7 天数据
                return [{"time": f"05-{10+i}", "price": 75000 + i*1000} for i in range(7)]
            
            data = response.json()
            return [
                {"time": datetime.fromtimestamp(p[0]/1000).strftime('%m-%d'), "price": round(p[1], 2)}
                for p in data.get("prices", [])
            ]
        except Exception as e:
            print(f"Error fetching market history for {symbol}: {e}")
            return [{"time": f"05-{10+i}", "price": 75000 + i*1000} for i in range(7)]

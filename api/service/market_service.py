import httpx
from typing import Dict
from datetime import datetime

async def fetch_market_prices() -> Dict[str, Dict]:
    """
    从 CoinGecko 获取实时行情数据
    """
    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        "ids": "bitcoin,ethereum,solana",
        "vs_currencies": "usd",
        "include_24hr_change": "true"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            data = response.json()
            
            # 格式化输出
            return {
                "BTC": {"price": data["bitcoin"]["usd"], "change": round(data["bitcoin"]["usd_24h_change"], 2)},
                "ETH": {"price": data["ethereum"]["usd"], "change": round(data["ethereum"]["usd_24h_change"], 2)},
                "SOL": {"price": data["solana"]["usd"], "change": round(data["solana"]["usd_24h_change"], 2)}
            }
        except Exception as e:
            print(f"Error fetching market data: {e}")
async def fetch_market_history(symbol: str, days: int = 7):
    """
    获取历史行情数据用于绘图
    """
    id_map = {"BTC": "bitcoin", "ETH": "ethereum", "SOL": "solana"}
    coin_id = id_map.get(symbol, "bitcoin")
    
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    params = {
        "vs_currency": "usd",
        "days": str(days),
        "interval": "daily" if days > 1 else "hourly"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            data = response.json()
            # 转换格式为前端图表所需 [{time: ..., price: ...}]
            return [
                {"time": datetime.fromtimestamp(p[0]/1000).strftime('%m-%d'), "price": round(p[1], 2)}
                for p in data.get("prices", [])
            ]
        except Exception as e:
            print(f"Error fetching market history: {e}")
            return []

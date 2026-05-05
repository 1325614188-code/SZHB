from fastapi import APIRouter
from service.market_service import fetch_market_prices, fetch_market_history

router = APIRouter(prefix="/api/market", tags=["Market"])

@router.get("/prices")
async def get_prices():
    return await fetch_market_prices()

@router.get("/history/{symbol}")
async def get_history(symbol: str, days: int = 7):
    return await fetch_market_history(symbol, days)

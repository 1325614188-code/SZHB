from fastapi import APIRouter, HTTPException, Depends
from service.news_service import get_news_with_analysis
from schema.news import NewsItem
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db

router = APIRouter(prefix="/api/news", tags=["News"])

@router.get("/{symbol}", response_model=List[NewsItem])
async def get_news(symbol: str, db: AsyncSession = Depends(get_db)):
    try:
        news = await get_news_with_analysis(symbol, db)
        return news
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException, Depends
from service.ai_service import analyze_crypto_trend
from service.news_service import get_news_with_analysis
from schema.news import PredictionResult
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from repository.prediction_repository import PredictionRepository

router = APIRouter(prefix="/api/predict", tags=["Prediction"])

@router.get("/{symbol}", response_model=PredictionResult)
async def get_prediction(symbol: str, db: AsyncSession = Depends(get_db)):
    try:
        repo = PredictionRepository(db)
        
        # 1. 检查缓存 (1 小时内有效)
        cached_pred = await repo.get_latest_prediction(symbol)
        if cached_pred:
            return PredictionResult(
                symbol=cached_pred.symbol,
                trend=cached_pred.trend,
                logic=cached_pred.logic,
                confidence=cached_pred.confidence,
                news_ids=cached_pred.news_ids
            )

        # 2. 获取新闻
        news = await get_news_with_analysis(symbol, db)
        if not news:
            raise HTTPException(status_code=404, detail="No news found to analyze")
        
        # 3. 调用 AI 分析
        prediction = await analyze_crypto_trend(symbol, news)
        
        # 4. 存入数据库
        await repo.save_prediction(prediction)
        
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

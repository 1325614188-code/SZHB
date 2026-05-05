from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from model.prediction import PredictionModel
from schema.news import PredictionResult
from datetime import datetime, timedelta

class PredictionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_latest_prediction(self, symbol: str, max_age_hours: int = 1) -> PredictionModel:
        """
        获取最新的预测结果，如果超过 max_age_hours 则认为失效
        """
        time_threshold = datetime.now() - timedelta(hours=max_age_hours)
        result = await self.db.execute(
            select(PredictionModel)
            .where(PredictionModel.symbol == symbol)
            .where(PredictionModel.created_at >= time_threshold)
            .order_by(PredictionModel.created_at.desc())
        )
        return result.scalars().first()

    async def save_prediction(self, prediction: PredictionResult):
        import uuid
        new_pred = PredictionModel(
            id=str(uuid.uuid4()),
            symbol=prediction.symbol,
            trend=prediction.trend,
            logic=prediction.logic,
            confidence=prediction.confidence,
            news_ids=prediction.news_ids,
            created_at=datetime.now()
        )
        self.db.add(new_pred)
        await self.db.commit()

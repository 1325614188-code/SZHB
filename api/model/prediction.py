from sqlalchemy import Column, String, Float, Text, DateTime, JSON
try:
    from database import Base
except ImportError:
    from ..database import Base
from datetime import datetime

class PredictionModel(Base):
    __tablename__ = "predictions"

    id = Column(String, primary_key=True, index=True) # UUID
    symbol = Column(String, index=True)
    trend = Column(String) # bullish, bearish, neutral
    logic = Column(Text)
    confidence = Column(Float)
    news_ids = Column(JSON) # 存储关联的新闻 ID 列表
    created_at = Column(DateTime, default=datetime.now)

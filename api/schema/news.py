from pydantic import BaseModel
from typing import List, Optional

class NewsItem(BaseModel):
    id: str
    title: str
    content: str
    source: str
    url: str
    published_at: str
    sentiment: Optional[str] = None # positive, negative, neutral

class PredictionResult(BaseModel):
    symbol: str
    trend: str # bullish, bearish, neutral
    logic: str
    confidence: float
    news_ids: List[str]

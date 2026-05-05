from sqlalchemy import Column, String, Text, DateTime
from database import Base
from datetime import datetime

class NewsModel(Base):
    __tablename__ = "news"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text)
    source = Column(String)
    url = Column(String, unique=True)
    published_at = Column(String) # 存储原始时间字符串
    sentiment = Column(String) # positive, negative, neutral
    symbol = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.now)

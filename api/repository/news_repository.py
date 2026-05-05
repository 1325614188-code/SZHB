from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from model.news import NewsModel
from schema.news import NewsItem
from typing import List

class NewsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_news_by_symbol(self, symbol: str, limit: int = 10) -> List[NewsModel]:
        result = await self.db.execute(
            select(NewsModel)
            .where(NewsModel.symbol == symbol)
            .order_by(NewsModel.created_at.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def add_news_items(self, items: List[NewsItem], symbol: str):
        for item in items:
            # 检查是否已存在（按 URL）
            existing = await self.db.execute(select(NewsModel).where(NewsModel.url == item.url))
            if existing.scalar_one_or_none():
                continue
            
            new_item = NewsModel(
                id=item.id,
                title=item.title,
                content=item.content,
                source=item.source,
                url=item.url,
                published_at=item.published_at,
                sentiment=item.sentiment,
                symbol=symbol
            )
            self.db.add(new_item)
        await self.db.commit()

    async def update_sentiment(self, news_id: str, sentiment: str):
        result = await self.db.execute(select(NewsModel).where(NewsModel.id == news_id))
        item = result.scalar_one_or_none()
        if item:
            item.sentiment = sentiment
            await self.db.commit()

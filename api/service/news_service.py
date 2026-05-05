import feedparser
import uuid
from datetime import datetime
from typing import List
from schema.news import NewsItem
import asyncio
import re

# 常用的加密货币 RSS 源
RSS_SOURCES = [
    {"name": "CoinDesk", "url": "https://www.coindesk.com/arc/outboundfeeds/rss/"},
    {"name": "Cointelegraph", "url": "https://cointelegraph.com/rss"},
    {"name": "NewsBTC", "url": "https://www.newsbtc.com/feed/"}
]

from repository.news_repository import NewsRepository
from service.ai_service import analyze_news_sentiment
from sqlalchemy.ext.asyncio import AsyncSession

async def fetch_rss_feed(source_name: str, url: str, symbol: str) -> List[NewsItem]:
    """
    异步抓取并解析单个 RSS 源，使用 feedparser 原生抓取以提高兼容性
    """
    try:
        # 在线程池中执行同步的 feedparser 抓取
        # feedparser 内部处理了 User-Agent 和基本的重定向
        feed = await asyncio.to_thread(feedparser.parse, url)
        
        if not feed.entries:
            print(f"No entries found for {source_name}")
            return []

        items = []
        keywords = [symbol.lower(), "crypto", "blockchain", "market", "web3"]
        if symbol.lower() == "btc":
            keywords.extend(["bitcoin", "btc"])
        elif symbol.lower() == "eth":
            keywords.extend(["ethereum", "eth"])

        for entry in feed.entries[:5]:
            title = entry.get("title", "")
            summary = entry.get("summary", entry.get("description", ""))
            
            content_text = (title + summary).lower()
            # 如果源本身就是加密货币相关的，或者包含了关键词，就认为相关
            if any(kw in content_text for kw in keywords) or source_name in ["CoinDesk", "Cointelegraph"]:
                # 清理 HTML 标签
                clean_summary = re.sub('<[^<]+?>', '', summary)
                items.append(NewsItem(
                    id=str(uuid.uuid4()),
                    title=title,
                    content=clean_summary[:300],
                    source=source_name,
                    url=entry.get("link", ""),
                    published_at=entry.get("published", datetime.now().isoformat()),
                    sentiment="neutral"
                ))
        return items
    except Exception as e:
        print(f"Error fetching RSS from {source_name}: {e}")
        return []

async def get_news_with_analysis(symbol: str, db: AsyncSession) -> List[NewsItem]:
    """
    聚合 RSS 源，优先保证展示，限制 AI 分析数量以防超时
    """
    repo = NewsRepository(db)
    
    # 1. 抓取最新新闻
    tasks = [fetch_rss_feed(src["name"], src["url"], symbol) for src in RSS_SOURCES]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    all_fetched_news = []
    seen_urls = set()
    for res in results:
        if isinstance(res, list):
            for item in res:
                if item.url not in seen_urls:
                    all_fetched_news.append(item)
                    seen_urls.add(item.url)
    
    # 2. 存入数据库
    if all_fetched_news:
        await repo.add_news_items(all_fetched_news, symbol)
    
    # 3. 从数据库获取最新新闻
    db_news = await repo.get_news_by_symbol(symbol, limit=10)
    
    # 4. 对新闻进行封装，限制 AI 分析的数量（每秒最多分析 2 条）
    news_items = []
    analysis_count = 0
    for row in db_news:
        item = NewsItem(
            id=row.id,
            title=row.title,
            content=row.content,
            source=row.source,
            url=row.url,
            published_at=row.published_at,
            sentiment=row.sentiment
        )
        
        # 限制 AI 分析数量，防止 Vercel 超时
        if item.sentiment == "neutral" and analysis_count < 2:
            try:
                # 给 AI 分析增加超时
                item.sentiment = await asyncio.wait_for(
                    analyze_news_sentiment(item.title, item.content),
                    timeout=5.0
                )
                await repo.update_sentiment(item.id, item.sentiment)
                analysis_count += 1
            except Exception as e:
                print(f"AI Analysis failed: {e}")
            
        news_items.append(item)
        
    return news_items

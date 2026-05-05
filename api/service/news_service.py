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
    异步抓取并解析单个 RSS 源，使用 urllib + User-Agent 绕过 Vercel 网络限制
    """
    try:
        from urllib.request import Request, urlopen
        import ssl
        
        # 伪装成真实浏览器，绕过 WAF
        req = Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        
        # 忽略 SSL 证书错误（由于某些节点证书不全）
        context = ssl._create_unverified_context()
        
        # 在线程池中执行同步抓取，设置 5 秒超时
        def do_fetch():
            with urlopen(req, context=context, timeout=5) as response:
                return response.read()
        
        content = await asyncio.to_thread(do_fetch)
        feed = await asyncio.to_thread(feedparser.parse, content)
        
        if not feed.entries:
            return []

        items = []
        for entry in feed.entries[:5]:
            title = entry.get("title", "")
            summary = entry.get("summary", entry.get("description", ""))
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
        print(f"Fetch Error from {source_name}: {e}")
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

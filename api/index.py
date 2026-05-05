import sys
import os

# 确保当前目录在路径中
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 尝试导入路由，如果失败则尝试相对导入
try:
    from api.predict import router as predict_router
    from api.market import router as market_router
    from api.news import router as news_router
    from database import init_db
except ImportError:
    from .api.predict import router as predict_router
    from .api.market import router as market_router
    from .api.news import router as news_router
    from .database import init_db

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时初始化数据库
    try:
        await init_db()
    except Exception as e:
        print(f"Database initialization failed: {e}")
    yield

app = FastAPI(title="Crypto Insight API", lifespan=lifespan)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(market_router)
app.include_router(news_router)

@app.get("/api/debug/db")
async def debug_db(db: AsyncSession = Depends(get_db)):
    """
    调试接口：检查数据库连通性
    """
    try:
        from sqlalchemy import text
        result = await db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Database connection is working!", "data": result.fetchone()[0]}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/debug/news")
async def debug_news():
    """
    调试接口：检查 RSS 源的连通性
    """
    import feedparser
    import asyncio
    from service.news_service import RSS_SOURCES
    
    debug_info = {}
    for src in RSS_SOURCES:
        try:
            feed = await asyncio.to_thread(feedparser.parse, src["url"])
            debug_info[src["name"]] = {
                "status": "success",
                "entries_count": len(feed.entries),
                "first_title": feed.entries[0].get("title") if feed.entries else "None"
            }
        except Exception as e:
            debug_info[src["name"]] = {"status": "error", "message": str(e)}
    
    return debug_info

@app.get("/")
async def root():
    return {"message": "Crypto Insight API is running"}

if __name__ == "__main__":
    uvicorn.run("index:app", host="127.0.0.1", port=8000, reload=True)

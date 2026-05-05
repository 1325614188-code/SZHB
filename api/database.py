from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 必须在这里导入模型，否则 Base.metadata.create_all 找不到表
try:
    from model.news import NewsItemDB
    from model.prediction import PredictionDB
except ImportError:
    from .model.news import NewsItemDB
    from .model.prediction import PredictionDB

# 优先从环境变量读取数据库连接字符串
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    DATABASE_URL = DATABASE_URL.strip()

# 如果没有配置环境变量，默认使用 SQLite (仅用于本地兜底)
if not DATABASE_URL:
    DATABASE_URL = "sqlite+aiosqlite:///./crypto_insight.db"
# 修正数据库 URL 格式并强制使用 asyncpg
if DATABASE_URL:
    # 去除 pgbouncer 参数，因为 asyncpg 驱动不直接支持它作为连接参数
    if "?pgbouncer=true" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("?pgbouncer=true", "")
    elif "&pgbouncer=true" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("&pgbouncer=true", "")
        
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# 创建异步数据库引擎，针对 Vercel + Supabase PgBouncer 优化
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={
        "command_timeout": 5,
        "statement_cache_size": 0,  # 必须设置为 0，否则无法兼容 Supabase 的连接池 (PgBouncer)
        "server_settings": {
            "application_name": "crypto_insight_vercel"
        }
    },
    echo=True
)

# 创建异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# 基类
class Base(DeclarativeBase):
    pass

async def init_db():
    """
    初始化数据库表
    """
    # 必须在此导入模型，SQLAlchemy 才能识别到表结构
    from model.news import NewsModel
    from model.prediction import PredictionModel
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    """
    获取数据库会话的依赖项
    """
    async with AsyncSessionLocal() as session:
        yield session

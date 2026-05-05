from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 优先从环境变量读取数据库连接字符串
# 格式: postgresql+asyncpg://postgres:password@db.xxx.supabase.co:5432/postgres
DB_URL = os.getenv("DATABASE_URL")

# 如果没有配置环境变量，默认使用 SQLite (仅用于本地兜底)
if not DB_URL:
    DB_URL = "sqlite+aiosqlite:///./crypto_insight.db"
elif DB_URL.startswith("postgresql://"):
    # 自动将 postgresql:// 转换为 postgresql+asyncpg:// 以适配 SQLAlchemy 异步驱动
    DB_URL = DB_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# 创建异步引擎
engine = create_async_engine(DB_URL, echo=True)

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

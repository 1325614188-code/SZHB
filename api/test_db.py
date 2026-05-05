import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from database import Base, init_db

# 强制加载最新环境变量
load_dotenv()

async def test_connection():
    db_url = os.getenv("DATABASE_URL")
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    
    print(f"正在尝试连接到 Supabase: {db_url.split('@')[1]}")
    
    try:
        # 初始化表
        await init_db()
        print("Success: Connected to Supabase and tables initialized!")
    except Exception as e:
        print(f"Error: Connection failed: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test_connection())

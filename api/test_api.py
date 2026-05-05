import httpx
import json

async def test():
    async with httpx.AsyncClient(timeout=60.0) as client:
        r = await client.get("http://127.0.0.1:8000/api/predict/BTC")
        print(json.dumps(r.json(), indent=2, ensure_ascii=False))

if __name__ == "__main__":
    import asyncio
    asyncio.run(test())

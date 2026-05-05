import os
import httpx
import json
from dotenv import load_dotenv
from schema.news import NewsItem, PredictionResult
from typing import List

load_dotenv()

API_KEY = os.getenv("DEEPSEEK_API_KEY")
BASE_URL = os.getenv("DEEPSEEK_BASE_URL")

async def analyze_crypto_trend(symbol: str, news: List[NewsItem]) -> PredictionResult:
    """
    使用 DeepSeek API 分析新闻对特定加密货币的影响并给出预测
    """
    news_context = "\n".join([
        f"- [{item.source}] {item.title}\n  摘要: {item.content[:300]}"
        for item in news
    ])

    prompt = f"""
    你是一个全球顶尖的加密货币量化分析师和宏观经济学家。
    请根据以下关于 {symbol} 的最新多源新闻资讯，进行深度逻辑推演，给出未来的行情趋势预测。

    待分析新闻：
    {news_context}

    分析要求：
    1. **多维度考量**：结合政策监管、机构动向、技术面信号和宏观经济（如美联储加息预期）进行综合判断。
    2. **逻辑推演**：你的逻辑分析必须是结构化的，展现出你是如何从新闻事件推导出结论的。
    3. **立场明确**：在 bullish（看涨）、bearish（看跌）、neutral（中性）中选其一。
    4. **置信度**：根据新闻的时效性和影响权重，给出 0.0 到 1.0 的置信评分。

    请严格按以下 JSON 格式输出，不要包含任何 Markdown 格式块或额外文字：
    {{
        "symbol": "{symbol}",
        "trend": "bullish/bearish/neutral",
        "logic": "1. [宏观面] ... \\n2. [机构面] ... \\n3. [市场情绪] ...",
        "confidence": 0.85
    }}
    """

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "你是一个严谨的加密货币市场预测助手，只输出纯 JSON 数据。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3, # 降低随机性，保证逻辑一致性
        "stream": False
    }

    async with httpx.AsyncClient(timeout=8.0) as client:
        try:
            response = await client.post(f"{BASE_URL}/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            content = result['choices'][0]['message']['content'].strip()
            # 移除可能存在的 Markdown 代码块标记
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            prediction_data = json.loads(content)
            
            return PredictionResult(
                symbol=symbol,
                trend=prediction_data.get('trend', 'neutral'),
                logic=prediction_data.get('logic', '无法获取逻辑分析'),
                confidence=prediction_data.get('confidence', 0.5),
                news_ids=[n.id for n in news]
            )
        except Exception as e:
            print(f"AI Trend Analysis Error: {e}")
            return PredictionResult(
                symbol=symbol,
                trend="neutral",
                logic="AI 分析请求超时或失败，正在后台重新尝试调度。请稍后刷新查看。",
                confidence=0.0,
                news_ids=[n.id for n in news]
            )

async def analyze_news_sentiment(title: str, content: str) -> str:
    """
    分析单条新闻的情感倾向
    """
    prompt = f"""
    请分析以下加密货币新闻的情感倾向。只返回 positive, negative 或 neutral 中的一个词。
    
    标题：{title}
    摘要：{content[:200]}
    """
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "你是一个情感分析专家，只输出 positive, negative 或 neutral。"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "stream": False
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.post(f"{BASE_URL}/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            sentiment = result['choices'][0]['message']['content'].strip().lower()
            if sentiment in ['positive', 'negative', 'neutral']:
                return sentiment
            return "neutral"
        except Exception as e:
            print(f"Sentiment Analysis Error: {e}")
            return "neutral"

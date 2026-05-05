const BASE_URL = import.meta.env.VITE_API_URL || '';

export interface PredictionResult {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  logic: string;
  confidence: number;
}

export interface MarketData {
  price: number;
  change: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  published_at: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export const fetchPrediction = async (symbol: string): Promise<PredictionResult> => {
  const response = await fetch(`${BASE_URL}/api/predict/${symbol}`);
  if (!response.ok) {
    throw new Error('Failed to fetch prediction');
  }
  return response.json();
};

export const fetchMarketPrices = async (): Promise<Record<string, MarketData>> => {
  const response = await fetch(`${BASE_URL}/api/market/prices`);
  if (!response.ok) {
    throw new Error('Failed to fetch market prices');
  }
  return response.json();
};

export const fetchNews = async (symbol: string): Promise<NewsItem[]> => {
  const response = await fetch(`${BASE_URL}/api/news/${symbol}`);
  if (!response.ok) {
    throw new Error('Failed to fetch news');
  }
  return response.json();
};
export const fetchMarketHistory = async (symbol: string, days: number = 7): Promise<{time: string, price: number}[]> => {
  const response = await fetch(`${BASE_URL}/api/market/history/${symbol}?days=${days}`);
  if (!response.ok) {
    throw new Error('Failed to fetch market history');
  }
  return response.json();
};

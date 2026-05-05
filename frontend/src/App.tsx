import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Bell, Settings, 
  Cpu, Newspaper, RefreshCw
} from 'lucide-react';
import { fetchPrediction, fetchMarketPrices, fetchNews, fetchMarketHistory } from './services/api';
import type { PredictionResult, MarketData, NewsItem as NewsType } from './services/api';
import PriceChart from './components/PriceChart';
import PredictPanel from './components/PredictPanel';
import NewsItem from './components/NewsItem';
import SentimentGauge from './components/SentimentGauge';

const SYMBOLS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'ADA', 'DOT', 'LINK', 'MATIC'];

function App() {
  const [activeSymbol, setActiveSymbol] = useState('BTC');
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [priceHistory, setPriceHistory] = useState<{time: string, price: number}[]>([]);
  const [news, setNews] = useState<NewsType[]>([]);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loadingPredict, setLoadingPredict] = useState(false);

  const loadMarket = async () => {
    try {
      const prices = await fetchMarketPrices();
      setMarketData(prices);
    } catch (e) {
      console.error('Market fetch failed', e);
    }
  };

  const loadDetailData = useCallback(async (symbol: string) => {
    setLoadingPredict(true);
    try {
      // 同时获取历史价格和新闻
      const [history, newsItems] = await Promise.all([
        fetchMarketHistory(symbol),
        fetchNews(symbol)
      ]);
      setPriceHistory(history);
      setNews(newsItems);
      
      // 异步获取 AI 预测
      fetchPrediction(symbol).then(setPrediction).finally(() => setLoadingPredict(false));
    } catch (e) {
      console.error('Detail fetch failed', e);
      setLoadingPredict(false);
    }
  }, []);

  useEffect(() => {
    loadMarket();
    const interval = setInterval(loadMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadDetailData(activeSymbol);
  }, [activeSymbol, loadDetailData]);

  return (
    <div className="app-container">
      {/* Column 1: Watchlist (Left) */}
      <aside className="glass-panel flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <Activity className="text-accent-primary" size={20} />
          <h2 className="text-lg font-black tracking-tighter">WATCHLIST</h2>
        </div>
        
        <div className="watchlist custom-scrollbar">
          {SYMBOLS.map(symbol => (
            <motion.div
              key={symbol}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSymbol(symbol)}
              className={`coin-card ${activeSymbol === symbol ? 'active' : ''}`}
            >
              <div className="flex flex-col">
                <span className="font-bold text-sm">{symbol}</span>
                <span className="text-[10px] text-muted">Market Cap rank</span>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">
                  ${marketData[symbol]?.price?.toLocaleString() || '---'}
                </div>
                <div className={`text-[10px] font-bold ${marketData[symbol]?.change >= 0 ? 'text-up' : 'text-down'}`}>
                  {marketData[symbol]?.change >= 0 ? '+' : ''}{marketData[symbol]?.change}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 flex justify-between px-2">
          <Settings size={18} className="text-muted cursor-pointer hover:text-white" />
          <Bell size={18} className="text-muted cursor-pointer hover:text-white" />
        </div>
      </aside>

      {/* Column 2: Main Analysis (Center) */}
      <main className="flex flex-col gap-5 overflow-y-auto pr-2">
        {/* Header Summary */}
        <div className="glass-panel py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center">
              <span className="text-xl font-black text-accent-primary">{activeSymbol[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-black">{activeSymbol} / USD</h1>
              <p className="text-xs text-muted tracking-widest uppercase">Deep Learning Analysis Engine</p>
            </div>
          </div>
          
          <div className="flex gap-8 px-6 border-l border-white/10">
            <div className="text-right">
              <p className="text-[10px] text-muted uppercase font-bold mb-1">Real-time Price</p>
              <p className="text-xl font-mono font-bold text-accent-primary">
                ${marketData[activeSymbol]?.price?.toLocaleString() || '---'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted uppercase font-bold mb-1">24H Change</p>
              <p className={`text-xl font-mono font-bold ${marketData[activeSymbol]?.change >= 0 ? 'text-up' : 'text-down'}`}>
                {marketData[activeSymbol]?.change >= 0 ? '+' : ''}{marketData[activeSymbol]?.change}%
              </p>
            </div>
          </div>
        </div>

        {/* Chart & Sentiment */}
        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 glass-panel h-[400px]">
            <PriceChart data={priceHistory} symbol={activeSymbol} />
          </div>
          <div className="glass-panel flex items-center justify-center">
            {prediction ? (
              <SentimentGauge trend={prediction.trend} confidence={prediction.confidence} />
            ) : (
              <div className="animate-pulse text-muted text-xs uppercase font-bold">Scanning Sentiment...</div>
            )}
          </div>
        </div>

        {/* AI Prediction Logic */}
        <div className="glass-panel min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Cpu size={18} className="text-accent-secondary" />
              <h3 className="text-sm font-bold uppercase tracking-widest">DeepSeek AI Reasoning</h3>
            </div>
            <button 
              onClick={() => loadDetailData(activeSymbol)}
              disabled={loadingPredict}
              className="flex items-center gap-2 text-[10px] font-bold bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={12} className={loadingPredict ? 'animate-spin' : ''} />
              REFRESH REPORT
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            {prediction ? (
              <motion.div
                key={activeSymbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PredictPanel 
                  symbol={activeSymbol}
                  trend={prediction.trend}
                  confidence={prediction.confidence}
                  logic={prediction.logic}
                />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-muted">
                <Activity size={32} className="mb-4 opacity-20 animate-bounce" />
                <p className="text-xs uppercase tracking-tighter">AI is crunching multi-source data...</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Column 3: News Feed (Right) */}
      <aside className="glass-panel flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <Newspaper className="text-accent-secondary" size={20} />
          <h2 className="text-lg font-black tracking-tighter">LIVE FEED</h2>
        </div>

        <div className="news-feed custom-scrollbar">
          {news.length > 0 ? (
            news.map(item => (
              <NewsItem 
                key={item.id}
                title={item.title}
                source={item.source}
                time={new Date(item.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                url={item.url}
                sentiment={item.sentiment}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted opacity-30 italic text-sm">
              No recent news for {activeSymbol}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export default App;

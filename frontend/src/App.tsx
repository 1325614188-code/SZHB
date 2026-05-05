import { useEffect, useState, useCallback } from 'react';
import PriceCard from './components/PriceCard';
import PredictPanel from './components/PredictPanel';
import NewsItem from './components/NewsItem';
import { Newspaper, BrainCircuit, RefreshCw, TrendingUp } from 'lucide-react';
import PriceChart from './components/PriceChart';
import { fetchPrediction, fetchMarketPrices, fetchNews, fetchMarketHistory } from './services/api';
import type { PredictionResult, MarketData, NewsItem as NewsType } from './services/api';

function App() {
  const [predictions, setPredictions] = useState<Record<string, PredictionResult | null>>({
    BTC: null,
    ETH: null
  });
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [priceHistory, setPriceHistory] = useState<{time: string, price: number}[]>([]);
  const [news, setNews] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSymbol, setActiveSymbol] = useState('BTC');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. 优先获取行情数据 (最快)
      try {
        const prices = await fetchMarketPrices();
        setMarketData(prices);
      } catch (e) {
        console.error('Failed to fetch market prices:', e);
      }

      // 2. 异步获取历史数据
      fetchMarketHistory(activeSymbol)
        .then(setPriceHistory)
        .catch(e => console.error('Failed to fetch market history:', e));

      // 3. 异步获取新闻
      fetchNews(activeSymbol)
        .then(setNews)
        .catch(e => console.error('Failed to fetch news:', e));

      // 4. 获取 AI 预测 (最慢，单独处理)
      try {
        const pred = await fetchPrediction(activeSymbol);
        setPredictions(prev => ({
          ...prev,
          [activeSymbol]: pred
        }));
      } catch (e) {
        console.error('Failed to fetch prediction:', e);
      }

    } catch (error) {
      console.error('General data loading error:', error);
    } finally {
      setLoading(false);
    }
  }, [activeSymbol]);

  useEffect(() => {
    loadData();
    // 每 60 秒轮询一次行情
    const interval = setInterval(() => {
      fetchMarketPrices().then(setMarketData).catch(console.error);
    }, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ marginBottom: '60px', textAlign: 'center', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: '-100px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          background: 'var(--primary-glow)',
          filter: 'blur(100px)',
          borderRadius: '50%',
          zIndex: -1,
          opacity: 0.3
        }}></div>
        <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-1px', marginBottom: '16px' }}>
          Crypto Insight AI
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: 500, maxWidth: '600px', margin: '0 auto' }}>
          融合多源 RSS 资讯与 DeepSeek 大模型的加密货币深度预测引擎
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '60px' }}>
        <PriceCard 
          name="Bitcoin" 
          symbol="BTC" 
          price={marketData.BTC?.price.toLocaleString() || '---'} 
          change={marketData.BTC?.change || 0} 
        />
        <PriceCard 
          name="Ethereum" 
          symbol="ETH" 
          price={marketData.ETH?.price.toLocaleString() || '---'} 
          change={marketData.ETH?.change || 0} 
        />
        <PriceCard 
          name="Solana" 
          symbol="SOL" 
          price={marketData.SOL?.price.toLocaleString() || '---'} 
          change={marketData.SOL?.change || 0} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
        <main>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="primary-gradient" style={{ padding: '10px', borderRadius: '12px' }}>
                <BrainCircuit size={24} color="#fff" />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>AI 趋势研报</h2>
            </div>
            <button 
              onClick={loadData}
              className="glass-card"
              style={{
                padding: '10px 20px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: '12px'
              }}
            >
              <RefreshCw size={18} className={loading ? 'glow-effect' : ''} />
              {loading ? '深度分析中...' : '即刻刷新分析'}
            </button>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <PriceChart data={priceHistory} symbol={activeSymbol} />
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            {['BTC', 'ETH'].map(s => (
              <button
                key={s}
                onClick={() => setActiveSymbol(s)}
                style={{
                  background: activeSymbol === s ? 'var(--primary-color)' : 'var(--card-bg)',
                  border: '1px solid var(--glass-border)',
                  color: '#fff',
                  padding: '8px 24px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.3s'
                }}
              >
                {s} 分析
              </button>
            ))}
          </div>

          {predictions[activeSymbol] ? (
            <PredictPanel 
              symbol={activeSymbol}
              trend={predictions[activeSymbol]!.trend}
              confidence={predictions[activeSymbol]!.confidence}
              logic={predictions[activeSymbol]!.logic}
            />
          ) : (
            <div className="glass-card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="glow-effect" style={{ marginBottom: '20px' }}>
                  <TrendingUp size={48} color="var(--primary-color)" />
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>正在调度 DeepSeek 构建 {activeSymbol} 预测报告...</p>
              </div>
            </div>
          )}
        </main>

        <aside>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '10px', borderRadius: '12px' }}>
              <Newspaper size={24} color="var(--secondary-color)" />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>多源聚合资讯</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
                暂未抓取到最新资讯...
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;

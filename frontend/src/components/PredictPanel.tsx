import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface PredictPanelProps {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  logic: string;
}

const PredictPanel = ({ symbol, trend, confidence, logic }: PredictPanelProps) => {
  const getTrendConfig = () => {
    switch (trend) {
      case 'bullish':
        return { color: 'var(--success)', icon: <TrendingUp size={32} />, label: '看涨 (Bullish)' };
      case 'bearish':
        return { color: 'var(--danger)', icon: <TrendingDown size={32} />, label: '看跌 (Bearish)' };
      default:
        return { color: 'var(--warning)', icon: <Minus size={32} />, label: '中性 (Neutral)' };
    }
  };

  const config = getTrendConfig();

  return (
    <div className="glass-card" style={{ borderLeft: `6px solid ${config.color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: config.color }}>{config.icon}</div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{config.label}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{symbol} 行情预测</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: config.color }}>{Math.round(confidence * 100)}%</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>置信度</div>
        </div>
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-secondary)' }}>
          <Info size={16} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>分析推演逻辑</span>
        </div>
        <div style={{ 
          fontSize: '1.05rem', 
          lineHeight: '1.8', 
          color: 'var(--text-primary)', 
          whiteSpace: 'pre-wrap',
          opacity: 0.9 
        }}>
          {logic}
        </div>
      </div>

      <div style={{ marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        * 以上分析仅供参考，不构成任何投资建议
      </div>
    </div>
  );
};

export default PredictPanel;

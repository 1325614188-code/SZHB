import { TrendingUp, TrendingDown, Minus, ShieldCheck } from 'lucide-react';

interface PredictPanelProps {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  logic: string;
}

const PredictPanel = ({ trend, confidence, logic }: PredictPanelProps) => {
  const normalizedConfidence = confidence <= 1 ? confidence * 100 : confidence;

  const getTrendConfig = () => {
    switch (trend) {
      case 'bullish':
        return { color: 'var(--up)', icon: <TrendingUp size={24} />, label: 'BULLISH' };
      case 'bearish':
        return { color: 'var(--down)', icon: <TrendingDown size={24} />, label: 'BEARISH' };
      default:
        return { color: 'var(--text-muted)', icon: <Minus size={24} />, label: 'NEUTRAL' };
    }
  };

  const config = getTrendConfig();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-white/5" style={{ color: config.color }}>
            {config.icon}
          </div>
          <div>
            <h4 className="text-xl font-black tracking-tighter" style={{ color: config.color }}>
              {config.label}
            </h4>
            <p className="text-[10px] text-muted uppercase font-bold tracking-widest">Market Projection</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-black font-mono" style={{ color: config.color }}>
            {Math.round(normalizedConfidence)}%
          </div>
          <div className="flex items-center gap-1 justify-end text-[10px] text-muted font-bold">
            <ShieldCheck size={10} />
            CONFIDENCE
          </div>
        </div>
      </div>

      <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
        <div className="text-[10px] text-accent-primary font-black mb-4 tracking-[0.2em] uppercase">
          Analytical Reasoning
        </div>
        <div className="text-sm leading-relaxed text-main/90 whitespace-pre-wrap font-medium">
          {logic}
        </div>
      </div>

      <div className="text-[9px] text-muted text-center uppercase tracking-widest opacity-50">
        Disclaimer: AI-generated insights. Not financial advice.
      </div>
    </div>
  );
};

export default PredictPanel;

import React from 'react';
import { motion } from 'framer-motion';

interface SentimentGaugeProps {
  trend: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
}

const SentimentGauge: React.FC<SentimentGaugeProps> = ({ trend, confidence }) => {
  const getRotation = () => {
    // -90deg is bearish, 0deg is neutral, 90deg is bullish
    if (trend === 'neutral') return 0;
    if (trend === 'bullish') return 90 * (confidence / 100);
    return -90 * (confidence / 100);
  };

  const getColor = () => {
    if (trend === 'bullish') return '#00ffaa';
    if (trend === 'bearish') return '#ff3366';
    return '#8a8f98';
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 relative h-40">
      <div className="text-xs uppercase tracking-widest text-muted mb-2 font-bold">AI Market Sentiment</div>
      
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Semi-circle background */}
        <div className="absolute top-0 left-0 w-full h-full border-b-0 rounded-t-full bg-white/5 border border-white/10" />
        
        {/* Gauge marks */}
        <div className="absolute bottom-0 left-0 w-full h-1 flex justify-between px-2">
          <div className="w-1 h-3 bg-red-500/50 -mt-2" />
          <div className="w-1 h-3 bg-gray-500/50 -mt-2" />
          <div className="w-1 h-3 bg-green-500/50 -mt-2" />
        </div>

        {/* Needle */}
        <motion.div 
          className="absolute bottom-0 left-1/2 w-1 h-20 origin-bottom bg-gradient-to-t from-white to-accent-primary"
          initial={{ rotate: 0 }}
          animate={{ rotate: getRotation() }}
          transition={{ type: "spring", stiffness: 60 }}
          style={{ translateX: '-50%', backgroundColor: getColor() }}
        />
        
        {/* Center dot */}
        <div className="absolute bottom-0 left-1/2 w-4 h-4 rounded-full bg-white -mb-2 -ml-2 shadow-lg shadow-black" />
      </div>

      <div className="mt-4 text-2xl font-black tracking-tight" style={{ color: getColor() }}>
        {trend.toUpperCase()} <span className="text-sm font-normal text-muted">({confidence}%)</span>
      </div>
    </div>
  );
};

export default SentimentGauge;

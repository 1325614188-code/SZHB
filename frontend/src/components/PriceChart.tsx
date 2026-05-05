import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PriceChartProps {
  data: { time: string; price: number }[];
  symbol: string;
}

const PriceChart = ({ data, symbol }: PriceChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-xs uppercase font-bold tracking-widest">
        No market data available
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black uppercase tracking-tighter">{symbol} Trend (7D)</h3>
        <span className="text-[10px] text-accent-primary font-bold">USD / USDT</span>
      </div>
      <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 'bold' }}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(10, 10, 15, 0.95)', 
                borderRadius: '12px', 
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              itemStyle={{ color: 'var(--accent-primary)' }}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="var(--accent-primary)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;

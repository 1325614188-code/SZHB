import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface PriceCardProps {
  name: string;
  symbol: string;
  price: string;
  change: number;
}

const PriceCard = ({ name, symbol, price, change }: PriceCardProps) => {
  const isPositive = change >= 0;

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {name}
          </h3>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{symbol}</div>
        </div>
        <div style={{ 
          background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          padding: '8px',
          borderRadius: '12px'
        }}>
          {isPositive ? <ArrowUpRight color="var(--success)" /> : <ArrowDownRight color="var(--danger)" />}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
        <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>${price}</div>
        <div style={{ 
          color: isPositive ? 'var(--success)' : 'var(--danger)',
          fontWeight: 600,
          marginBottom: '4px'
        }}>
          {isPositive ? '+' : ''}{change}%
        </div>
      </div>
    </div>
  );
};

export default PriceCard;

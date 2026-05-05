import { ExternalLink, Tag } from 'lucide-react';

interface NewsItemProps {
  title: string;
  source: string;
  time: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

const NewsItem = ({ title, source, time, url, sentiment }: NewsItemProps) => {
  const getSentimentColor = () => {
    switch (sentiment) {
      case 'positive': return 'var(--success)';
      case 'negative': return 'var(--danger)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="glass-card" 
      style={{ 
        padding: '16px', 
        display: 'block', 
        textDecoration: 'none', 
        color: 'inherit',
        borderRadius: '16px'
      }}
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <div style={{ 
          fontSize: '0.7rem', 
          fontWeight: 700, 
          padding: '2px 8px', 
          borderRadius: '4px', 
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <Tag size={10} />
          {source}
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', opacity: 0.6, marginTop: '2px' }}>
          {time}
        </div>
      </div>
      
      <h4 style={{ 
        fontSize: '1rem', 
        fontWeight: 600, 
        lineHeight: '1.4', 
        marginBottom: '12px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {title}
      </h4>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: getSentimentColor() 
          }}></div>
          <span style={{ fontSize: '0.75rem', color: getSentimentColor(), fontWeight: 600 }}>
            {sentiment === 'positive' ? '利好' : sentiment === 'negative' ? '利空' : '中性'}
          </span>
        </div>
        <ExternalLink size={14} color="var(--text-secondary)" />
      </div>
    </a>
  );
};

export default NewsItem;

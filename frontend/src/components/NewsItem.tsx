import { ExternalLink } from 'lucide-react';

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
      case 'positive': return 'var(--up)';
      case 'negative': return 'var(--down)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="news-item-compact group"
      style={{ textDecoration: 'none' }}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="news-source">{source}</span>
        <span className="text-[10px] text-muted opacity-60">{time}</span>
      </div>
      
      <h4 className="news-title-compact group-hover:text-accent-primary transition-colors">
        {title}
      </h4>
      
      <div className="flex items-center gap-2 mt-2">
        <div 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ background: getSentimentColor() }}
        />
        <span className="text-[10px] font-bold tracking-tighter" style={{ color: getSentimentColor() }}>
          {sentiment === 'positive' ? 'BULLISH' : sentiment === 'negative' ? 'BEARISH' : 'NEUTRAL'}
        </span>
        <ExternalLink size={10} className="ml-auto text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </a>
  );
};

export default NewsItem;

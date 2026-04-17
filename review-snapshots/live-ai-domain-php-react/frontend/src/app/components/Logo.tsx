import { Leaf } from 'lucide-react';
import { Link } from 'react-router';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
}

export function Logo({ size = 'md', showText = true, showTagline = true }: LogoProps) {
  const sizes = {
    sm: {
      icon: 'h-8 w-8',
      iconLeaf: 'h-5 w-5',
      text: 'text-lg',
      tagline: 'text-xs',
    },
    md: {
      icon: 'h-10 w-10',
      iconLeaf: 'h-6 w-6',
      text: 'text-xl',
      tagline: 'text-xs',
    },
    lg: {
      icon: 'h-16 w-16',
      iconLeaf: 'h-10 w-10',
      text: 'text-2xl',
      tagline: 'text-sm',
    },
  };

  const currentSize = sizes[size];

  return (
    <Link to="/" className="flex items-center gap-2">
      <div className={`flex ${currentSize.icon} items-center justify-center rounded-full`} style={{ backgroundColor: '#2E7D32' }}>
        <Leaf className={`${currentSize.iconLeaf} text-white`} />
      </div>
      {showText && (
        <div>
          <h1 className={`${currentSize.text} leading-tight`} style={{ color: '#2E7D32' }}>
            Greenfield Local Hub
          </h1>
          {showTagline && (
            <p className={currentSize.tagline} style={{ color: '#6B6B6B' }}>
              Fresh from farm to table
            </p>
          )}
        </div>
      )}
    </Link>
  );
}

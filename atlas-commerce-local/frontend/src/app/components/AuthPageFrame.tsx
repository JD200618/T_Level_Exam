import { Link } from 'react-router';
import { Logo } from './Logo';
import { Card } from './ui/core';

interface AuthPageFrameProps {
  subtitle: string;
  backTo: string;
  backLabel: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}

export function AuthPageFrame({ subtitle, backTo, backLabel, children, badge }: AuthPageFrameProps) {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: '#FAFAF5' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" showText={true} showTagline={true} />
        </div>

        {badge ? (
          <div className="text-center mb-8">
            {badge}
            <p style={{ color: '#6B6B6B' }}>{subtitle}</p>
          </div>
        ) : (
          <p className="text-center mb-8" style={{ color: '#6B6B6B' }}>
            {subtitle}
          </p>
        )}

        <Card className="p-8">{children}</Card>

        <div className="text-center mt-6">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 transition-colors hover:underline"
            style={{ color: '#6B6B6B' }}
          >
            ← {backLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

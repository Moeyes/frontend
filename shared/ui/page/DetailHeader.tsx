import type { ReactNode } from 'react';
import { BackLink } from './BackLink';
import { cn } from '@/lib/utils';

interface DetailHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  action?: ReactNode;
  backHref?: string;
  className?: string;
}

export function DetailHeader({
  title,
  subtitle,
  badge,
  action,
  backHref,
  className,
}: DetailHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      <BackLink href={backHref} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}

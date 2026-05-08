import Link from 'next/link';
import { Button } from '../Button';

interface PageEmptyStateProps {
  messageKey: string;
  message?: string;
  ctaKey?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
}

export function PageEmptyState({
  message,
  ctaLabel,
  ctaHref,
  ctaOnClick,
}: PageEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="text-4xl">📭</div>
      <p className="text-muted-foreground">{message ?? 'មិនទាន់មានទិន្នន័យ'}</p>
      {ctaLabel && ctaHref && (
        <Button asChild variant="default">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      )}
      {ctaLabel && ctaOnClick && (
        <Button onClick={ctaOnClick}>{ctaLabel}</Button>
      )}
    </div>
  );
}

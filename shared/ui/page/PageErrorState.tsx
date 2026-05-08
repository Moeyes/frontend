'use client';
import { Button } from '../Button';

interface PageErrorStateProps {
  error?: Error;
  onRetry?: () => void;
}

export function PageErrorState({ error, onRetry }: PageErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="text-4xl">⚠️</div>
      <p className="text-destructive font-medium">
        {error?.message ?? 'មានបញ្ហាក្នុងការផ្ទុកទិន្នន័យ'}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          ព្យាយាមម្ដងទៀត
        </Button>
      )}
    </div>
  );
}

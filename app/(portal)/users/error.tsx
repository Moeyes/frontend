'use client';
import { PageErrorState } from '@/shared/ui';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <PageErrorState error={error} onRetry={reset} />;
}

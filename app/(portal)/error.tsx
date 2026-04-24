'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { PageEmptyState } from '@/shared/ui/page/PageEmptyState';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Portal Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <PageEmptyState
        icon={AlertTriangle}
        title="Something went wrong"
        description={error.message || "An unexpected error occurred in the portal."}
        action={
          <div className="flex items-center gap-3">
            <Button onClick={reset} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Try again
            </Button>
            <Link href="/dashboard">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Go to dashboard
              </Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}

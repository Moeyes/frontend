'use client';

export default function LoginError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-sm text-destructive">{error.message || 'Something went wrong.'}</p>
      <button
        onClick={reset}
        className="text-sm text-primary underline underline-offset-4"
      >
        Try again
      </button>
    </div>
  );
}

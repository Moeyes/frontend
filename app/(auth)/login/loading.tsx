import { Spinner } from '@/shared/ui';

export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

import Link from 'next/link';
import { Button } from '../Button';

export function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="text-6xl font-bold text-muted-foreground">404</div>
      <p className="text-muted-foreground">រកមិនឃើញទំព័រ</p>
      <Button asChild variant="outline">
        <Link href="/dashboard">ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង</Link>
      </Button>
    </div>
  );
}

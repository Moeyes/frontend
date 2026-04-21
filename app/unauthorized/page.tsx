'use client';

import { useAuth } from '@/features/auth/context';
import { useRouter } from 'next/navigation';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROLE_DEFAULT_ROUTE } from '@/config/constants';

export default function UnauthorizedPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleGoHome = () => {
        if (user) {
            router.push(ROLE_DEFAULT_ROUTE[user.role]);
        } else {
            router.push('/login');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background px-4">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-destructive/10 rounded-full">
                        <ShieldX className="w-12 h-12 text-destructive" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-3">Access Denied</h1>
                <p className="text-muted-foreground mb-2">
                    You don&apos;t have permission to view this page.
                </p>
                {user && (
                    <p className="text-sm text-muted-foreground mb-8">
                        Signed in as{' '}
                        <span className="font-medium text-foreground">{user.username}</span>{' '}
                        ({user.role})
                    </p>
                )}
                <div className="flex gap-3 justify-center">
                    <Button onClick={handleGoHome}>Go to Dashboard</Button>
                    <Button variant="outline" onClick={logout}>
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
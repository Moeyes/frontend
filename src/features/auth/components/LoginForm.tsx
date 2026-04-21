'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLogin } from '@/features/auth/hooks';
import { Button } from '@/components/ui/button';
import { AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';
import { ROLE_DEFAULT_ROUTE } from '@/config/constants';

function LoginFormInner() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, isPending, error, clearError } = useLogin();
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        const role = await login(username, password);
        if (role) {
            const returnUrl = searchParams.get('returnUrl');
            const destination = returnUrl 
                ? decodeURIComponent(returnUrl)
                :  ROLE_DEFAULT_ROUTE[role] ?? '/dashboard'
            router.push(destination);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <LogIn className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to your sports event account</p>
                </div>

                <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/30 p-4">
                            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                autoComplete="username"
                                className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full px-4 py-2 pr-10 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending || !username || !password}
                            className="w-full h-11 font-medium"
                        >
                            {isPending ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <a href="/register" className="text-primary hover:text-primary/90 font-medium">
                            Register here
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

// useSearchParams() requires a Suspense boundary in Next.js App Router
export function LoginForm() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        }>
            <LoginFormInner />
        </Suspense>
    );
}
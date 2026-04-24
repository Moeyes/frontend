'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore, type MouseEvent } from 'react';
import { ArrowRight, Trophy, Users } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useAuth } from '@/core/auth';
import { routes } from '@/core/config/constants';

export function HomePage() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const mounted = useSyncExternalStore(
        (cb) => { window.addEventListener('storage', cb); return () => window.removeEventListener('storage', cb); },
        () => true,
        () => false,
    );

    const handleRegisterClick = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        router.push(isAuthenticated ? routes.register : routes.login);
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 border-b border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                                C
                            </div>
                            <h1 className="text-xl font-bold text-primary">Choschmous</h1>
                        </div>

                        <nav className="flex items-center gap-4">
                            {mounted && isAuthenticated ? (
                                <>
                                    <span className="text-sm text-muted-foreground">
                                        {user?.english_name || user?.khmer_name}
                                    </span>
                                    <Link href={routes.dashboard}>
                                        <Button variant="default" size="sm">
                                            Dashboard
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={routes.login}>
                                        <Button variant="outline" size="sm">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href={routes.login} onClick={handleRegisterClick}>
                                        <Button variant="default" size="sm">
                                            Register
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            <main>
                <section className="px-4 py-24 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-6 text-5xl font-bold text-foreground">
                            Sports Event Management Platform
                        </h1>
                        <p className="mb-12 text-xl text-muted-foreground">
                            Streamline participant registration, manage events, and coordinate sports activities with our comprehensive platform.
                        </p>

                        {mounted && !isAuthenticated && (
                            <div className="mb-12 flex justify-center gap-4">
                                <Link href={routes.login} onClick={handleRegisterClick}>
                                    <Button size="lg" className="gap-2">
                                        Get Started <ArrowRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href={routes.login}>
                                    <Button variant="outline" size="lg">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                <section className="border-t border-border bg-card px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Platform Features</h2>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            <div className="rounded-lg border border-border bg-background p-8">
                                <Users className="mb-4 h-12 w-12 text-primary" />
                                <h3 className="mb-3 text-lg font-bold text-foreground">Easy Registration</h3>
                                <p className="text-muted-foreground">
                                    Simple and quick registration process for athletes and leaders with multi-language support.
                                </p>
                            </div>

                            <div className="rounded-lg border border-border bg-background p-8">
                                <Trophy className="mb-4 h-12 w-12 text-primary" />
                                <h3 className="mb-3 text-lg font-bold text-foreground">Event Management</h3>
                                <p className="text-muted-foreground">
                                    Organize and manage multiple sports events with categories, sports, and participant tracking.
                                </p>
                            </div>

                            <div className="rounded-lg border border-border bg-background p-8">
                                <Trophy className="mb-4 h-12 w-12 text-primary" />
                                <h3 className="mb-3 text-lg font-bold text-foreground">Analytics Dashboard</h3>
                                <p className="text-muted-foreground">
                                    Real-time insights and detailed reports for event organizers and administrators.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="mb-6 text-3xl font-bold text-foreground">Ready to get started?</h2>
                        <p className="mb-8 text-lg text-muted-foreground">
                            Join thousands of sports organizations using Choschmous to streamline their operations.
                        </p>

                        {mounted && !isAuthenticated && (
                            <Link href={routes.login} onClick={handleRegisterClick}>
                                <Button size="lg">Register Now</Button>
                            </Link>
                        )}
                    </div>
                </section>
            </main>

            <footer className="border-t border-border bg-card py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="text-center text-sm text-muted-foreground">
                        <p>© 2026 Choschmous. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

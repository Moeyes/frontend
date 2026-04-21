/**
 * Home Page
 * 
 * Landing page with navigation based on auth state
 */

'use client';

import { useAuth } from '@/features/auth/context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trophy, Users, ArrowRight } from 'lucide-react';
import { routes } from '@/config/constants';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  /**
   * Handle register navigation
   * If user is authenticated, go to register
   * If not authenticated, go to login first
   */
  const handleRegisterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(routes.login);
    } else {
      router.push(routes.register);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                C
              </div>
              <h1 className="text-xl font-bold text-primary">Choschmous</h1>
            </div>

            <nav className="flex items-center gap-4">
              {isAuthenticated ? (
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

      {/* Hero Section */}
      <main>
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Sports Event Management Platform
            </h1>
            <p className="text-xl text-muted-foreground mb-12">
              Streamline participant registration, manage events, and coordinate sports activities with our comprehensive platform.
            </p>

            {!isAuthenticated && (
              <div className="flex gap-4 justify-center mb-12">
                <Link href={routes.login} onClick={handleRegisterClick}>
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="w-5 h-5" />
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

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Platform Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-background rounded-lg border border-border p-8">
                <Users className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Easy Registration
                </h3>
                <p className="text-muted-foreground">
                  Simple and quick registration process for athletes and leaders with multi-language support.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-background rounded-lg border border-border p-8">
                <Trophy className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Event Management
                </h3>
                <p className="text-muted-foreground">
                  Organize and manage multiple sports events with categories, sports, and participant tracking.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-background rounded-lg border border-border p-8">
                <Trophy className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-3">
                  Analytics Dashboard
                </h3>
                <p className="text-muted-foreground">
                  Real-time insights and detailed reports for event organizers and administrators.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of sports organizations using Choschmous to streamline their operations.
            </p>

            {!isAuthenticated && (
              <Link href={routes.login} onClick={handleRegisterClick}>
                <Button size="lg">
                  Register Now
                </Button>
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-muted-foreground text-sm">
            <p>© 2026 Choschmous. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

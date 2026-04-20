'use client';

import { useState } from 'react';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { FormField } from '@/components/FormField';
import { FormStatus } from '@/components/FormField';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // TODO: Implement actual authentication
    setTimeout(() => {
      setIsLoading(false);
      setError('Login functionality coming soon. Please use the registration flow.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <LogIn className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your sports event account
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <FormStatus status="error" message={error} />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <FormField
                label="Email Address"
                isRequired
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </FormField>

              {/* Password Field */}
              <FormField
                label="Password"
                isRequired
              >
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </FormField>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="text-primary hover:text-primary/90 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                className="w-full"
              >
                Sign In
              </Button>
            </form>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  New to our platform?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <Button
              variant="outline"
              size="md"
              className="w-full"
              onClick={() => (window.location.href = routes.register)}
            >
              Create an Account
            </Button>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <Link
              href="#"
              className="text-primary hover:text-primary/90 font-medium transition-colors"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

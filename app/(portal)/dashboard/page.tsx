/**
 * Dashboard Page
 * 
 * Main dashboard with role-based sections
 */

'use client';

import { useRequireAuth } from '@/features/auth/hooks';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import Link from 'next/link';
import { BarChart3, Users, Trophy, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    useRequireAuth();

    if (!user) return null;

    const isOrganization = user.role === UserRole.ORGANIZATION;
    const isFederation = user.role === UserRole.FEDERATION;
    const isAdmin = user.role === UserRole.ADMIN;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                            <p className="text-muted-foreground mt-1">
                                Welcome, {user.english_name || user.khmer_name}!
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-lg">
                                {user.role === UserRole.ADMIN ? 'Administrator' : user.role === UserRole.ORGANIZATION ? 'Organization' : 'Federation'}
                            </span>
                            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2">
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Registration Stats */}
                    <div className="bg-card rounded-lg border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Registrations</h3>
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">1,234</p>
                        <p className="text-sm text-muted-foreground mt-2">Total participants</p>
                    </div>

                    {/* Events */}
                    <div className="bg-card rounded-lg border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Events</h3>
                            <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">12</p>
                        <p className="text-sm text-muted-foreground mt-2">Active events</p>
                    </div>

                    {/* Reports */}
                    <div className="bg-card rounded-lg border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Reports</h3>
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">8</p>
                        <p className="text-sm text-muted-foreground mt-2">Generated reports</p>
                    </div>

                    {/* Documents */}
                    <div className="bg-card rounded-lg border border-border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Documents</h3>
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">42</p>
                        <p className="text-sm text-muted-foreground mt-2">Uploaded files</p>
                    </div>
                </div>

                {/* Quick Access Links */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-foreground mb-6">Quick Access</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(isOrganization || isAdmin) && (
                            <>
                                <Link href="/register">
                                    <div className="bg-card rounded-lg border border-border p-4 hover:border-primary transition-colors cursor-pointer">
                                        <h3 className="font-semibold text-foreground mb-2">Register Participants</h3>
                                        <p className="text-sm text-muted-foreground">Add new athlete or leader registrations</p>
                                    </div>
                                </Link>

                                <Link href="/bynumber">
                                    <div className="bg-card rounded-lg border border-border p-4 hover:border-primary transition-colors cursor-pointer">
                                        <h3 className="font-semibold text-foreground mb-2">By Number</h3>
                                        <p className="text-sm text-muted-foreground">View registrations by participant number</p>
                                    </div>
                                </Link>

                                <Link href="/bysport">
                                    <div className="bg-card rounded-lg border border-border p-4 hover:border-primary transition-colors cursor-pointer">
                                        <h3 className="font-semibold text-foreground mb-2">By Sport</h3>
                                        <p className="text-sm text-muted-foreground">View registrations organized by sport</p>
                                    </div>
                                </Link>
                            </>
                        )}

                        {(isFederation || isAdmin) && (
                            <Link href="/bycategory">
                                <div className="bg-card rounded-lg border border-border p-4 hover:border-primary transition-colors cursor-pointer">
                                    <h3 className="font-semibold text-foreground mb-2">By Category</h3>
                                    <p className="text-sm text-muted-foreground">View registrations by sport category</p>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

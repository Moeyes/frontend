/**
 * Dashboard Page
 */

'use client';

import { useAuth } from '@/features/auth/context';
import { useRequireAuth } from '@/features/auth/hooks';
import { 
    useDashboard, 
    StatsGrid, 
    GenderChart, 
    TopOrgsTable, 
    RecentEnrollments 
} from '@/features/dashboard';
import { LogOut, LayoutDashboard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    useRequireAuth();
    
    const { data, isLoading, error } = useDashboard();

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <LayoutDashboard className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-foreground">Dashboard</h1>
                            <p className="text-sm text-muted-foreground font-medium">
                                Welcome back, <span className="text-foreground">{user.khmer_name || user.english_name}</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-secondary/50 rounded-lg border border-border">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Role</p>
                            <p className="text-xs font-black text-foreground uppercase">{user.role}</p>
                        </div>
                        <Button onClick={handleLogout} variant="outline" size="sm" className="gap-2 h-11 px-4">
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Dashboard...</p>
                    </div>
                ) : error ? (
                    <div className="p-12 text-center bg-error/5 border border-error/20 rounded-2xl">
                        <p className="text-error font-bold">Failed to load dashboard data</p>
                        <p className="text-xs text-muted-foreground mt-1">Please check your connection and try again</p>
                    </div>
                ) : data ? (
                    <>
                        <StatsGrid stats={data.stats} />

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1">
                                <GenderChart data={data.genderDistribution} />
                            </div>
                            <div className="lg:col-span-1">
                                <TopOrgsTable data={data.topOrganizations} />
                            </div>
                            <div className="lg:col-span-1">
                                <RecentEnrollments data={data.recentEnrollments} />
                            </div>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

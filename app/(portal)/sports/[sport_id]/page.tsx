'use client';

import { use } from 'react';
import { useSportDetail } from '@/features/sports/hooks';
import { CategoryList } from '@/features/sports/components';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Trophy, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface SportDetailPageProps {
    params: Promise<{ sport_id: string }>;
}

export default function SportDetailPage({ params }: SportDetailPageProps) {
    const { sport_id } = use(params);
    const sportId = Number(sport_id);
    
    const { data: sport, isLoading } = useSportDetail(sportId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (!sport) {
        return (
            <div className="container mx-auto py-10 px-4 text-center">
                <h1 className="text-2xl font-bold text-foreground">Sport not found</h1>
                <Link href="/sports" className="text-primary hover:underline mt-4 inline-block">
                    Back to Sports
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/sports" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors w-fit">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Sports
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                            <Trophy className="w-4 h-4" />
                            {sport.sport_type || 'Sport Discipline'}
                        </div>
                        <h1 className="text-3xl font-bold text-foreground">{sport.name_kh}</h1>
                        {sport.name_en && (
                            <p className="text-lg text-muted-foreground">{sport.name_en}</p>
                        )}
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline" className="gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Categories Section */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm min-h-[400px]">
                <CategoryList sportId={sportId} />
            </div>
        </div>
    );
}

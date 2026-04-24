'use client';

import Link from 'next/link';
import { LayoutDashboard, Trophy } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
    ContentPanel,
    DetailHeader,
    PageLoadingState,
    PageNotFound,
    PageShell,
} from '@/shared';
import { useSportDetail } from '../hooks';
import { CategoryList } from './CategoryList';

interface SportDetailPageProps {
    sportId: number;
}

export function SportDetailPage({ sportId }: SportDetailPageProps) {
    const { data: sport, isLoading } = useSportDetail(sportId);

    if (isLoading) {
        return <PageLoadingState />;
    }

    if (!sport) {
        return (
            <PageNotFound
                title="Sport not found"
                action={
                    <Link href="/sports" className="text-primary hover:underline">
                        Back to Sports
                    </Link>
                }
            />
        );
    }

    return (
        <PageShell padded={false} size="wide">
            <DetailHeader
                backHref="/sports"
                backLabel="Back to Sports"
                eyebrow={sport.sport_type || 'Sport Discipline'}
                eyebrowIcon={Trophy}
                title={sport.name_kh}
                description={sport.name_en}
                action={
                    <Link href="/dashboard">
                        <Button variant="outline" className="gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>
                }
            />

            <ContentPanel className="min-h-[400px]">
                <CategoryList sportId={sportId} />
            </ContentPanel>
        </PageShell>
    );
}

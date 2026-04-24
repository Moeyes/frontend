import { Metadata } from 'next';
import { SportDetailPage } from '@/modules/sports';
import { getSportById } from '@/modules/sports/services';

interface PageProps {
    params: Promise<{ sport_id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { sport_id } = await params;
    try {
        const sport = await getSportById(Number(sport_id));
        return { 
            title: sport?.name_kh || 'Sport Detail',
        };
    } catch (error) {
        console.error('Failed to fetch sport data for metadata:', error);
        return { title: 'Sport Detail' };
    }
}

export default async function Page({ params }: PageProps) {
    const { sport_id } = await params;
    return <SportDetailPage sportId={Number(sport_id)} />;
}

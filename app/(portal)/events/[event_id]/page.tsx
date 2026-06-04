import { Metadata } from 'next';
import { EventDetailPage } from '@/modules/events';
import { eventsRepository } from '@/modules/events/adapters';

interface PageProps {
    params: Promise<{ event_id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { event_id } = await params;
    try {

        const event = await eventsRepository.getPublicById(Number(event_id));
        return {
            title: event?.name || 'Event Detail',
        };
    } catch {
        return { title: 'Event Detail' };
    }
}

export default async function Page({ params }: PageProps) {
    const { event_id } = await params;
    return <EventDetailPage eventId={Number(event_id)} />;
}

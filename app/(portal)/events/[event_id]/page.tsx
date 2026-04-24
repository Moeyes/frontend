import { Metadata } from 'next';
import { EventDetailPage } from '@/modules/events';
import { getEventById } from '@/modules/events/services';

interface PageProps {
    params: Promise<{ event_id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { event_id } = await params;
    try {

        const event = await getEventById(Number(event_id));
        return { 
            title: event?.name || 'Event Detail',
        };
    } catch (error) {
        console.error('Failed to fetch event data for metadata:', error);
        return { title: 'Event Detail' };
    }
}

// export async function generateMetadata({ params }: { params: { event_id: string } }) {
//   try {
//     const event = await getEventById(Number(params.event_id));
//     return { title: event.name };
//   } catch (err) {
//     console.warn('Failed to fetch event data for metadata:', err);
//     return { title: 'Event' }; // fallback — never throws
//   }
// }

export default async function Page({ params }: PageProps) {
    const { event_id } = await params;
    return <EventDetailPage eventId={Number(event_id)} />;
}

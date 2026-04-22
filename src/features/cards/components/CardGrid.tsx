'use client';

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { UserRole } from '@/features/auth/types';
import { useEvents } from '@/features/events/hooks/useEvents';
import { useOrganizations } from '@/features/organizations/hooks/useOrganizations';
import { useCards } from '../hooks/useCards';
import CardIframe from './CardIframe';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardData } from '../types';
import CardViewModal from './CardViewModal';

export const CardGrid: React.FC = () => {
  const { user, role } = useAuth();
  const isAdmin = role === UserRole.ADMIN;
  
  const { data: events } = useEvents();
  const { data: orgs } = useOrganizations();

  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');

  // Derived effective IDs to avoid setState in effect
  const eventId = useMemo(() => {
    if (selectedEventId) return selectedEventId;
    if (events && events.length > 0) return String(events[0].id);
    return '';
  }, [selectedEventId, events]);

  const orgId = useMemo(() => {
    if (isAdmin) return selectedOrgId;
    if (user?.org_id) return String(user.org_id);
    return '';
  }, [isAdmin, selectedOrgId, user]);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);

  const { cards, total, isLoading } = useCards(orgId, eventId, page);

  const filteredCards = useMemo(() => {
    if (!searchTerm) return cards;
    return cards.filter(card => 
      card.participantName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cards, searchTerm]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-end justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">Event</label>
            <Select value={eventId} onValueChange={(val) => setSelectedEventId(val || '')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Event" />
              </SelectTrigger>
              <SelectContent>
                {events?.map(e => (
                  <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Organization</label>
              <Select value={orgId} onValueChange={(val) => setSelectedOrgId(val || '')}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent>
                  {orgs?.map(o => (
                    <SelectItem key={o.id} value={String(o.id)}>{o.name_kh}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1 flex-1">
            <label className="text-xs font-medium text-gray-500">Search</label>
            <Input 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[300px]"
            />
          </div>
        </div>

        <Button variant="outline" className="text-xs" disabled>
          {/* TODO: exportPDF teammate — replace with: downloadBulkPdf(orgId, eventId) */}
          Export All
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-gray-100 animate-pulse h-[220px] rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCards.map((card) => (
              <div key={card.pId} className="flex flex-col border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-gray-50 p-2 flex justify-center">
                  <CardIframe {...card} scale={0.45} />
                </div>
                <div className="p-2 space-y-2 border-t">
                  <div className="text-[12px] font-medium truncate text-gray-800" title={card.participantName}>
                    {card.participantName}
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      className="flex-1 text-[11px] h-7 px-2" 
                      onClick={() => setSelectedCard(card)}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-[11px] h-7 px-2"
                      disabled
                    >
                      {/* TODO: exportPDF teammate — replace with: downloadCardPdf(card.pId, card.orgId, card.eventId) */}
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCards.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border">
              No cards found for this selection.
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {selectedCard && (
        <CardViewModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </div>
  );
};

export default CardGrid;

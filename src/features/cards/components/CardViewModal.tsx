'use client';

import React, { useEffect } from 'react';
import { CardData } from '../types';
import CardIframe from './CardIframe';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface CardViewModalProps {
  card: CardData | null;
  onClose: () => void;
}

const CardViewModal: React.FC<CardViewModalProps> = ({ card, onClose }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!card) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-xl shadow-2xl p-6 flex flex-col items-center gap-6 max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-6 h-6 text-gray-500" />
        </button>

        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {card.prefix && <span className="mr-1">{card.prefix}</span>}
            {card.participantName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{card.orgName || card.eventName}</p>
        </div>

        <div className="border rounded-lg shadow-inner bg-gray-50 p-4">
          <CardIframe {...card} scale={1} />
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
          <Button className="flex-1" disabled>
            {/* TODO: exportPDF teammate */}
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CardViewModal;

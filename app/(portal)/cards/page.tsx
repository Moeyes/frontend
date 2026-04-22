'use client';

import React from 'react';
import { useRequireRole } from '@/features/auth/hooks/useRequireRole';
import { UserRole } from '@/features/auth/types';
import { CardGrid } from '@/features/cards/components/CardGrid';

export default function CardsPage() {
  // admin = ADMIN, user1 = ORGANIZATION
  const { isLoading } = useRequireRole([UserRole.ADMIN, UserRole.ORGANIZATION]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Participant Cards</h1>
        <p className="text-gray-500 mt-2">
          Generate and manage participant cards for National Primary School Games 2026.
        </p>
      </div>

      <CardGrid />
    </div>
  );
}

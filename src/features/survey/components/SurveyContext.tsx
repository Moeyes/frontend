'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { SurveyContextType, SurveyFormData } from '../types';
import { fetchEvents } from '../services';
import { useSurvey } from '../hooks/useSurvey';

const SurveyContextComponent = createContext<SurveyContextType | undefined>(undefined);

export function SurveyProvider({ children }: { children: React.ReactNode }) {
    const survey = useSurvey();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Preload events on mount
        setIsLoading(true);
        fetchEvents().finally(() => setIsLoading(false));
    }, []);

    const value: SurveyContextType = {
        formData: {
            eventId: survey.eventId,
            eventName: survey.eventName,
            organizationId: survey.organizationId,
            organizationName: survey.organizationName,
            sportIds: survey.sportIds,
            sportNames: survey.sportNames,
            sportsActualIds: survey.sportsActualIds,
        },
        setFields: survey.setFields,
        reset: survey.reset,
    };

    return (
        <SurveyContextComponent.Provider value={value}>
            {children}
        </SurveyContextComponent.Provider>
    );
}

export function useSurveyContext() {
    const context = useContext(SurveyContextComponent);
    if (!context) {
        throw new Error('useSurveyContext must be used within SurveyProvider');
    }
    return context;
}

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
    fetchEvents, 
    fetchEventSports,
    fetchEventSportOrgs,
    getPdfData
} from '../services';
import type { Event, Organization, Sport, PdfDataResponse } from '../types';
import { Button } from '@/components/ui/button';
import { 
    FileText, 
    Loader2,
    RefreshCcw,
    CheckCircle2
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { SportsListPDF } from './SportsListPDF';
import { PdfFilterFormFields } from './PdfFilterFormFields';

const EVENT_TYPES = [
    { id: 'NATIONAL', name_kh: 'កីឡាជាតិ' },
    { id: 'UNIVERSITY', name_kh: 'កីឡាឧត្តមសិក្សា និងមធ្យមសិក្សា​បចេ្ចកទេសថ្នាក់ជាតិថ្នាក់ជាតិ' },
    { id: 'HIGH_SCHOOL', name_kh: 'សិស្សមធ្យមសិក្សា​ថ្នាក់ជាតិ' },
    { id: 'PRIMARY_SCHOOL', name_kh: 'កីឡាសិស្សបថមសិក្សាជាតិ' },
];

export function PdfFilterForm() {
    const [step, setStep] = useState<'event_type' | 'event' | 'sport' | 'organization' | 'preview'>('event_type');
    const [loading, setLoading] = useState(false);
    
    // Data states
    const [events, setEvents] = useState<Event[]>([]);
    const [sports, setSports] = useState<Sport[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [pdfData, setPdfData] = useState<PdfDataResponse | null>(null);

    const form = useForm({
        defaultValues: {
            eventTypeId: null,
            eventId: null,
            organizationId: null,
            sportId: null
        }
    });

    const { watch, setValue } = form;
    const formData = watch();

    const handleSelectType = async (id: string) => {
        setValue('eventTypeId', id as any);
        setValue('eventId', null as any);
        setValue('sportId', null as any);
        setValue('organizationId', null as any);
        setLoading(true);
        try {
            const allEvents = await fetchEvents();
            setEvents(allEvents.filter(e => {
                const eventTypeFromApi = String(e.type).trim();
                const selectedType = String(id).trim();
                
                if (eventTypeFromApi === selectedType) return true;
                
                const khValue = EVENT_TYPES.find(t => t.id === selectedType)?.name_kh;
                if (khValue && eventTypeFromApi === khValue.trim()) return true;
                
                return false;
            }));
            setStep('event');
        } catch (error) {
            console.error("Load events failed", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEvent = async (id: number) => {
        setValue('eventId', id as any);
        setValue('sportId', null as any);
        setValue('organizationId', null as any);
        setLoading(true);
        try {
            const eventSports = await fetchEventSports(id);
            setSports(eventSports);
            setStep('sport');
        } catch (error) {
            console.error("Failed to fetch sports for event", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSport = async (id: number) => {
        setValue('sportId', id as any);
        setValue('organizationId', null as any);
        setLoading(true);
        try {
            const orgs = await fetchEventSportOrgs(formData.eventId!, id);
            setOrganizations(orgs);
            setStep('organization');
        } catch (error) {
            console.error("Failed to fetch orgs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOrg = async (id: number) => {
        setValue('organizationId', id as any);
        setLoading(true);
        try {
            const data = await getPdfData(formData.sportId!, id, formData.eventId!);
            setPdfData(data);
            setStep('preview');
        } catch (error) {
            console.error("Failed to fetch PDF data", error);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep('event_type');
        setPdfData(null);
        setValue('eventTypeId', null as any);
        setValue('sportId', null as any);
        setValue('eventId', null as any);
        setValue('organizationId', null as any);
    };

    const getPrevStep = () => {
        if (step === 'event') return 'event_type';
        if (step === 'sport') return 'event';
        if (step === 'organization') return 'sport';
        return null;
    };

    const prevStep = getPrevStep();

    if (loading && step !== 'preview') {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 animate-in fade-in duration-700">
                <Loader2 className="w-12 h-12 animate-spin text-primary/60" />
                <p className="text-sm font-medium text-slate-500 tracking-wide uppercase animate-pulse">កំពុងទាញយកទិន្នន័យ...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Step Content */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8">
                    {step !== 'preview' && prevStep && (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setStep(prevStep as any)} 
                            className="mb-6 -ml-2 text-slate-400 hover:text-primary hover:bg-primary/5 gap-1 transition-all"
                        >
                            ← ត្រឡប់ក្រោយ
                        </Button>
                    )}

                    <PdfFilterFormFields 
                        form={form}
                        step={step}
                        eventTypes={EVENT_TYPES}
                        events={events}
                        organizations={organizations}
                        sports={sports}
                        selectedEventType={formData.eventTypeId}
                        selectedEventId={formData.eventId}
                        selectedOrgId={formData.organizationId}
                        selectedSportId={formData.sportId}
                        onSelectEventType={handleSelectType}
                        onSelectEvent={handleSelectEvent}
                        onSelectOrg={handleSelectOrg}
                        onSelectSport={handleSelectSport}
                    />

                    {step === 'preview' && pdfData && (
                        <div className="flex flex-col items-center gap-8 py-4 animate-in zoom-in-95 duration-500">
                            <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">ឯកសាររួចរាល់ហើយ!</h2>
                                <div className="space-y-1 mb-8">
                                    <p className="text-sm text-slate-500">
                                        ប្រភេទកីឡា: <span className="font-bold text-slate-900">{pdfData.sport_name}</span>
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        អង្គភាព: <span className="font-bold text-slate-900">{pdfData.org_name}</span>
                                    </p>
                                </div>
                                
                                <div className="grid gap-3 max-w-sm mx-auto">
                                    <PDFDownloadLink 
                                        document={<SportsListPDF data={pdfData} />} 
                                        fileName={`បញ្ជីឈ្មោះ_${pdfData.sport_name}_${pdfData.org_name}.pdf`}
                                        className="w-full bg-primary text-white py-4 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                    >
                                        {({ loading }) => (
                                            <>
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                                                {loading ? 'កំពុងរៀបចំ...' : 'ទាញយកបញ្ជីឈ្មោះ (PDF)'}
                                            </>
                                        )}
                                    </PDFDownloadLink>
                                    <Button variant="outline" onClick={reset} className="rounded-xl h-12 gap-2 border-slate-200 hover:bg-slate-50 transition-all">
                                        <RefreshCcw className="w-4 h-4" />
                                        បង្កើតបញ្ជីថ្មី
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

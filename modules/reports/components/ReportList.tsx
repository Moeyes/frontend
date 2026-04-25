'use client';

import { useState, useEffect } from 'react';
import { useReportMutations } from '../hooks/useReportMutations';
import { useAuth, UserRole } from '@/core/auth';
import { loadCascadingData, type CascadingDataLoaded } from '@/core/lib/reference-data';
import { FileSpreadsheet, Download, Filter, Building2, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useTranslations } from 'next-intl';

export function ReportList() {
    const { user } = useAuth();
    const { downloadOrgSport, isDownloadingOrgSport, downloadParticipant, isDownloadingParticipant } = useReportMutations();
    const t = useTranslations('reports');

    const [cascadingData, setCascadingData] = useState<CascadingDataLoaded | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState('');

    const isAdmin = user?.role === UserRole.ADMIN;

    useEffect(() => {
        async function init() {
            const data = await loadCascadingData();
            setCascadingData(data);
            if (user?.org_id) setSelectedOrgId(String(user.org_id));
            setLoading(false);
        }
        init();
    }, [user]);

    const handleDownloadOrgSport = () => {
        if (!selectedEventId) return alert(t('pleaseSelectEvent'));
        downloadOrgSport({ event_id: Number(selectedEventId), organization_id: selectedOrgId ? Number(selectedOrgId) : undefined });
    };

    const handleDownloadParticipant = () => {
        if (!selectedEventId) return alert(t('pleaseSelectEvent'));
        downloadParticipant({ event_id: Number(selectedEventId), organization_id: selectedOrgId ? Number(selectedOrgId) : undefined });
    };

    if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                    <Filter className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">{t('filters')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><Calendar className="w-3.5 h-3.5" />{t('selectEvent')}</label>
                        <select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none">
                            <option value="">{t('chooseEvent')}</option>
                            {cascadingData?.events.map(e => <option key={e.id} value={e.id}>{e.name_kh || e.name_en}</option>)}
                        </select>
                    </div>
                    {isAdmin && (
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground"><Building2 className="w-3.5 h-3.5" />{t('selectOrganization')}</label>
                            <select value={selectedOrgId} onChange={(e) => setSelectedOrgId(e.target.value)} className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm focus:ring-1 focus:ring-primary outline-none">
                                <option value="">{t('allOrganizations')}</option>
                                {cascadingData?.organizations.map(o => <option key={o.id} value={o.id}>{o.name_kh || o.name_en}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card rounded-xl border border-border p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-6"><FileSpreadsheet className="w-6 h-6 text-green-600" /></div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{t('orgSportReport.title')}</h3>
                    <p className="text-sm text-muted-foreground mb-8">{t('orgSportReport.description')}</p>
                    <Button onClick={handleDownloadOrgSport} disabled={isDownloadingOrgSport || !selectedEventId} className="w-full gap-2 bg-green-600 hover:bg-green-700 h-11">
                        {isDownloadingOrgSport ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}{t('orgSportReport.download')}
                    </Button>
                </div>
                <div className="bg-card rounded-xl border border-border p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-6"><FileSpreadsheet className="w-6 h-6 text-blue-600" /></div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{t('participantReport.title')}</h3>
                    <p className="text-sm text-muted-foreground mb-8">{t('participantReport.description')}</p>
                    <Button onClick={handleDownloadParticipant} disabled={isDownloadingParticipant || !selectedEventId} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-11">
                        {isDownloadingParticipant ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}{t('participantReport.download')}
                    </Button>
                </div>
            </div>
        </div>
    );
}

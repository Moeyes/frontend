'use client';
import { useCallback, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileSpreadsheet, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, Button, Badge } from '@/shared/ui';
import { ReportFilterBar, type ReportFilters } from './ReportFilterBar';
import { Rpt3PrintPreview } from './Rpt3PrintPreview';
import { Rpt5PrintPreview } from './Rpt5PrintPreview';
import { useRpt3Data, useRpt5Data } from '../hooks/useReportData';
import { downloadRpt3Excel } from '../lib/rpt3-excel';
import { downloadRpt5Excel } from '../lib/rpt5-excel';

// ── Print utility (browser-native, reliable Khmer rendering) ────────────────
function printElement(el: HTMLElement | null): void {
  if (!el) return;
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;width:0;height:0;border:0';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument!;
  // Copy Tailwind + Battambang font into the print frame
  doc.write(`<!DOCTYPE html><html><head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Battambang', sans-serif; font-size: 10pt; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #000; padding: 2px 4px; }
      @page { size: A4 portrait; margin: 1.5cm; }
    </style>
  </head><body>${el.innerHTML}</body></html>`);
  doc.close();
  iframe.contentWindow!.focus();
  iframe.contentWindow!.print();
  setTimeout(() => document.body.removeChild(iframe), 1500);
}

// ── Report card UI ────────────────────────────────────────────────────────────
interface ReportDef {
  slug:      string;
  titleKh:   string;
  descEn:    string;
  available: boolean;
}

const REPORT_DEFS: ReportDef[] = [
  { slug: 'rpt3', titleKh: 'ចុះចំនួន',                     descEn: 'RPT-3 — Numbers per org by sport',             available: true  },
  { slug: 'rpt5', titleKh: 'រាយនាមរួម',                   descEn: 'RPT-5 — Full name roster',                    available: true  },
  { slug: 'rpt1', titleKh: 'ចុះប្រភេទកីឡា',               descEn: 'RPT-1 — Sport type list',                     available: false },
  { slug: 'rpt2', titleKh: 'ចំនួនរួម',                      descEn: 'RPT-2 — Full matrix (all orgs × all sports)', available: false },
  { slug: 'rpt4', titleKh: 'អាល់ប៊ុម',                      descEn: 'RPT-4 — Participant photo album',             available: false },
  { slug: 'rpt6', titleKh: 'ថ្នាក់ដឹកនាំគ្រប់ប្រភេទកីឡា', descEn: 'RPT-6 — Leadership roster',                   available: false },
  { slug: 'rpt7', titleKh: 'គ្រូបង្វឹក អត្តពលិក',          descEn: 'RPT-7 — Coaches + athletes',                 available: false },
  { slug: 'rpt8', titleKh: 'ប្រតិភូ អ្នកដឹកនាំ',            descEn: 'RPT-8 — Delegates + team leaders',           available: false },
];

// ── Main component ────────────────────────────────────────────────────────────
export function ReportsPage() {
  const t = useTranslations('reports');

  const [filters, setFilters] = useState<ReportFilters>({ org_id: null, events_id: null });
  const params = filters.org_id && filters.events_id
    ? { orgId: filters.org_id, eventId: filters.events_id }
    : null;

  const rpt3 = useRpt3Data(params);
  const rpt5 = useRpt5Data(params);

  const rpt3Ref = useRef<HTMLDivElement>(null);
  const rpt5Ref = useRef<HTMLDivElement>(null);

  const [downloading, setDownloading] = useState<string | null>(null);

  const handleExcel = useCallback((slug: string) => {
    setDownloading(slug);
    try {
      if (slug === 'rpt3' && rpt3.data) {
        downloadRpt3Excel(rpt3.data);
        toast.success(t('downloadSuccess'));
      } else if (slug === 'rpt5' && rpt5.data) {
        downloadRpt5Excel(rpt5.data);
        toast.success(t('downloadSuccess'));
      }
    } catch {
      toast.error(t('downloadError'));
    } finally {
      setDownloading(null);
    }
  }, [rpt3.data, rpt5.data, t]);

  const handlePrint = useCallback((slug: string) => {
    if (slug === 'rpt3') printElement(rpt3Ref.current);
    if (slug === 'rpt5') printElement(rpt5Ref.current);
  }, []);

  const isDataReady = (slug: string) => {
    if (!params) return false;
    if (slug === 'rpt3') return !!rpt3.data && !rpt3.isLoading;
    if (slug === 'rpt5') return !!rpt5.data && !rpt5.isLoading;
    return false;
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      {/* Filter bar */}
      <div className="space-y-2">
        <p className="text-sm font-medium">{t('filters')}</p>
        <ReportFilterBar filters={filters} onChange={setFilters} />
        {!params && (
          <p className="text-xs text-muted-foreground">{t('selectBoth')}</p>
        )}
      </div>

      {/* Report cards */}
      <div className="space-y-3">
        {REPORT_DEFS.map((rpt) => (
          <div
            key={rpt.slug}
            className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{rpt.titleKh}</span>
                {rpt.available ? (
                  <Badge variant="secondary" className="text-xs">{'មាន'}</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">{'នឹងមកដល់ឆាប់ៗ'}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{rpt.descEn}</p>
            </div>

            {rpt.available ? (
              <div className="flex items-center gap-2 shrink-0">
                {/* Excel button */}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!isDataReady(rpt.slug) || downloading === rpt.slug}
                  onClick={() => handleExcel(rpt.slug)}
                >
                  {downloading === rpt.slug
                    ? <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    : <FileSpreadsheet className="h-3 w-3 mr-1" />
                  }
                  {t('download')}
                </Button>
                {/* Print / PDF button */}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!isDataReady(rpt.slug)}
                  onClick={() => handlePrint(rpt.slug)}
                >
                  <Printer className="h-3 w-3 mr-1" />
                  {t('pdf')}
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" disabled onClick={() => toast.info('មុខងារនេះនឹងបន្ថែមនៅពេលឆាប់ៗ')}>
                {'នឹងមកដល់ឆាប់ៗ'}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Loading / error states for RPT-3 and RPT-5 */}
      {params && (rpt3.isLoading || rpt5.isLoading) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('downloading')}
        </div>
      )}

      {/* Hidden print previews (mounted off-screen, printed on demand) */}
      {rpt3.data && (
        <div className="hidden print:hidden" aria-hidden="true">
          <Rpt3PrintPreview ref={rpt3Ref} data={rpt3.data} />
        </div>
      )}
      {rpt5.data && (
        <div className="hidden print:hidden" aria-hidden="true">
          <Rpt5PrintPreview ref={rpt5Ref} data={rpt5.data} />
        </div>
      )}
    </div>
  );
}

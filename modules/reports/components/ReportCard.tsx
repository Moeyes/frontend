'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Download, AlertTriangle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card, CardContent, Button } from '@/shared/ui';
import { downloadExcelBlob, type ReportParams } from '../services/reports.service';
import type { ReactNode } from 'react';

interface ReportCardProps {
  titleKey:      string;
  descKey:       string;
  available:     boolean;
  downloadPath?: string;
  filenameKey?:  string;
  params:        ReportParams | null;
  preview?:      ReactNode;
  requiresOrgId?: boolean;
}

export function ReportCard({
  titleKey, descKey, available, downloadPath, filenameKey, params, preview,
}: ReportCardProps) {
  const t = useTranslations('reports');
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canDownload = available && !!params && !!downloadPath;

  const handleDownload = async () => {
    if (!canDownload) return;
    setIsDownloading(true);
    try {
      const filename = filenameKey
        ? `${t(filenameKey as Parameters<typeof t>[0])}.xlsx`
        : 'report.xlsx';
      await downloadExcelBlob(downloadPath, params!, filename);
      toast.success(t('downloadSuccess'));
    } catch {
      toast.error(t('downloadError'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className={!available ? 'opacity-75' : undefined}>
      <CardContent className="pt-5 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{t(titleKey as Parameters<typeof t>[0])}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t(descKey as Parameters<typeof t>[0])}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!available && (
              <div className="flex items-center gap-1 text-xs text-yellow-700">
                <AlertTriangle className="h-3 w-3" />
                {t('backendGap')}
              </div>
            )}

            {available && preview && (
              <Button
                variant="ghost" size="sm"
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview
                  ? <ChevronUp className="h-4 w-4" />
                  : <ChevronDown className="h-4 w-4" />}
                {t('preview')}
              </Button>
            )}

            <Button
              size="sm"
              disabled={!canDownload || isDownloading}
              onClick={handleDownload}
              title={!params ? t('selectBoth') : !available ? t('backendGapDetail') : undefined}
            >
              {isDownloading
                ? <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                : <Download className="h-4 w-4 mr-1" aria-hidden="true" />}
              {isDownloading ? t('downloading') : t('download')}
            </Button>
          </div>
        </div>

        {showPreview && available && preview && (
          <div className="pt-2 border-t">
            {preview}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { QueryBoundary, PageHeader, BackLink, Card, CardContent, Button, Modal } from '@/shared/ui';
import { TextInputField } from '@/shared/form';
import { formatDate } from '@/core/lib/format';
import { useLanguage } from '@/core/i18n';
import { ROUTES } from '@/core/config';
import { useSport } from '../hooks/useSport';
import { useUpdateSport } from '../hooks/useUpdateSport';
import { useDeleteSport } from '../hooks/useDeleteSport';
import { SportCategoryManager } from './SportCategoryManager';
import { sportCreateSchema, type SportCreateFormValues } from '../services/schema';

interface SportDetailPageProps {
  sportId: number;
}

export function SportDetailPage({ sportId }: SportDetailPageProps) {
  const t          = useTranslations('sports');
  const tc         = useTranslations('common');
  const { locale } = useLanguage();
  const router     = useRouter();
  const query      = useSport(sportId);
  const updateMut  = useUpdateSport(sportId);
  const deleteMut  = useDeleteSport();

  const [editing, setEditing]     = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const form = useForm<SportCreateFormValues>({
    resolver: zodResolver(sportCreateSchema),
  });

  const openEdit = () => {
    if (query.data) {
      form.reset({
        name_kh:    query.data.name_kh    ?? '',
        sport_type: query.data.sport_type ?? '',
      });
    }
    setEditing(true);
  };

  const handleUpdate = async (values: SportCreateFormValues) => {
    try {
      await updateMut.mutateAsync(values);
      toast.success(t('updateSuccess'));
      setEditing(false);
    } catch {
      toast.error(tc('somethingWentWrong'));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(sportId);
      toast.success(t('deleteSuccess'));
      router.push(ROUTES.sports.list);
    } catch {
      toast.error(tc('somethingWentWrong'));
    }
  };

  return (
    <div className="space-y-6">
      <BackLink href={ROUTES.sports.list} label={t('backToSports')} />
      <PageHeader
        title={t('sportName')}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={openEdit}>
              {tc('edit')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              {tc('delete')}
            </Button>
          </div>
        }
      />

      <QueryBoundary query={query}>
        {(sport) => (
          <>
            <Card>
              <CardContent className="pt-5 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">{sport.name_kh}</h2>
                  {sport.sport_type && (
                    <p className="text-sm text-muted-foreground mt-1">{sport.sport_type}</p>
                  )}
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">{t('sportType')}</dt>
                    <dd className="font-medium">{sport.sport_type ?? '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">{t('columns.createdAt')}</dt>
                    <dd className="font-medium">{formatDate(sport.created_at, locale)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <SportCategoryManager sportId={sportId} />
          </>
        )}
      </QueryBoundary>

      {/* Edit modal */}
      <Modal
        open={editing}
        onOpenChange={(o) => { if (!o) setEditing(false); }}
        title={t('editSport')}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setEditing(false)}>{tc('cancel')}</Button>
            <Button
              loading={updateMut.isPending}
              onClick={form.handleSubmit(handleUpdate)}
            >
              {tc('save')}
            </Button>
          </div>
        }
      >
        <form className="space-y-4 py-2">
          <TextInputField control={form.control} name="name_kh"    labelKey="sports.sportName" required />
          <TextInputField control={form.control} name="sport_type" labelKey="sports.sportType" required />
        </form>
      </Modal>

      {/* Delete confirmation */}
      <Modal
        open={confirmDelete}
        onOpenChange={(o) => { if (!o) setConfirmDelete(false); }}
        title={tc('confirm')}
        description={t('deleteConfirm')}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>{tc('cancel')}</Button>
            <Button
              variant="destructive"
              loading={deleteMut.isPending}
              onClick={handleDelete}
            >
              {tc('delete')}
            </Button>
          </div>
        }
      >
        <span />
      </Modal>
    </div>
  );
}

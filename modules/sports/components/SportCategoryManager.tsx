'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  Button, QueryBoundary, PageEmptyState, SectionHeader, Badge, Modal, Skeleton,
} from '@/shared/ui';
import { TextInputField, SelectField } from '@/shared/form';
import { useEvents } from '@/modules/events';
import { useCategories }    from '../hooks/useCategories';
import { useAddCategory }   from '../hooks/useAddCategory';
import { useUpdateCategory } from '../hooks/useUpdateCategory';
import { useDeleteCategory } from '../hooks/useDeleteCategory';
import {
  categoryCreateSchema, categoryEditSchema,
  type CategoryCreateFormValues, type CategoryEditFormValues,
} from '../services/schema';
import type { CategoryPublic } from '../services/sports.service';

interface SportCategoryManagerProps {
  sportId: number;
}

const GENDER_OPTIONS = [
  { value: 'MALE',   label: '' },
  { value: 'FEMALE', label: '' },
];

function CategoryRow({
  cat, sportId, eventId,
}: { cat: CategoryPublic; sportId: number; eventId: number }) {
  const t  = useTranslations('sports.categories');
  const tc = useTranslations('common');
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateMutation = useUpdateCategory(eventId, sportId);
  const deleteMutation = useDeleteCategory(eventId, sportId);

  const form = useForm<CategoryEditFormValues>({
    resolver: zodResolver(categoryEditSchema),
    defaultValues: { category_name: cat.category },
  });

  if (editing) {
    return (
      <li className="flex items-center gap-2 py-2 px-3">
        <form
          className="flex items-center gap-2 flex-1"
          onSubmit={form.handleSubmit((v) =>
            updateMutation.mutate(
              { category_id: cat.id, category_name: v.category_name },
              { onSuccess: () => setEditing(false) }
            )
          )}
        >
          <div className="flex-1"><TextInputField control={form.control} name="category_name" label="" /></div>
          <Button type="submit" size="sm" variant="ghost" loading={updateMutation.isPending}>
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between gap-3 py-2 px-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">{cat.category}</span>
        {cat.gender && (
          <Badge variant="outline" className="text-xs">
            {t(`genders.${cat.gender}` as Parameters<typeof t>[0]) || cat.gender}
          </Badge>
        )}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)} aria-label={tc('edit')}>
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost" size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setDeleteOpen(true)}
          aria-label={tc('delete')}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      <Modal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={tc('confirm')}
        description={t('deleteCategoryConfirm')}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>{tc('cancel')}</Button>
            <Button
              variant="destructive"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(cat.id, { onSettled: () => setDeleteOpen(false) })}
            >
              {tc('delete')}
            </Button>
          </div>
        }
      >
        <span />
      </Modal>
    </li>
  );
}

function AddCategoryForm({
  sportId, eventId, onCancel,
}: { sportId: number; eventId: number; onCancel: () => void }) {
  const t  = useTranslations('sports.categories');
  const tc = useTranslations('common');
  const mutation = useAddCategory(eventId, sportId);

  const form = useForm<CategoryCreateFormValues>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: { category_name: '', gender: 'MALE' },
  });

  const genderOptions = [
    { value: 'MALE',   label: t('genders.MALE') },
    { value: 'FEMALE', label: t('genders.FEMALE') },
  ];

  return (
    <form
      className="flex items-end gap-2 p-3 border-t"
      onSubmit={form.handleSubmit((v) =>
        mutation.mutate(
          { sport_id: sportId, event_id: eventId, category_name: v.category_name, gender: v.gender },
          { onSuccess: () => { form.reset(); onCancel(); } }
        )
      )}
    >
      <TextInputField control={form.control} name="category_name" labelKey="sports.categories.categoryName" required />
      <SelectField control={form.control} name="gender" labelKey="sports.categories.gender" options={genderOptions} required />
      <div className="flex gap-1 pb-1.5">
        <Button type="submit" size="sm" loading={mutation.isPending} disabled={mutation.isPending}>
          {tc('add')}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>{tc('cancel')}</Button>
      </div>
    </form>
  );
}

export function SportCategoryManager({ sportId }: SportCategoryManagerProps) {
  const t  = useTranslations('sports.categories');
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const eventsQuery    = useEvents({ limit: 200 });
  const categoriesQuery = useCategories(selectedEventId ?? 0, sportId);

  return (
    <section className="space-y-3">
      <SectionHeader title={t('title')} />

      {/* Event picker */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-muted-foreground shrink-0">{t('selectEvent')}</label>
        {eventsQuery.isLoading ? (
          <Skeleton className="h-9 w-48" />
        ) : (
          <select
            className="text-sm border rounded px-3 py-2 bg-background"
            value={selectedEventId ?? ''}
            onChange={(e) => {
              setSelectedEventId(e.target.value ? Number(e.target.value) : null);
              setAdding(false);
            }}
          >
            <option value="">—</option>
            {(eventsQuery.data?.data ?? []).map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name_kh}</option>
            ))}
          </select>
        )}
      </div>

      {!selectedEventId ? (
        <p className="text-sm text-muted-foreground">{t('noEventSelected')}</p>
      ) : (
        <div className="border rounded-lg">
          <QueryBoundary
            query={categoriesQuery}
            empty={<PageEmptyState message={t('noCategories')} />}
          >
            {(cats) => (
              <ul className="divide-y">
                {cats.map((cat) => (
                  <CategoryRow key={cat.id} cat={cat} sportId={sportId} eventId={selectedEventId} />
                ))}
              </ul>
            )}
          </QueryBoundary>

          {adding ? (
            <AddCategoryForm
              sportId={sportId}
              eventId={selectedEventId}
              onCancel={() => setAdding(false)}
            />
          ) : (
            <div className="p-3 border-t">
              <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
                <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
                {t('addCategory')}
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

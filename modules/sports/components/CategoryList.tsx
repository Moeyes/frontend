'use client';

import { useState } from 'react';
import { Category, Gender } from '../types';
import { useCategories, useDeleteCategory } from '../hooks';
import { CategoryForm } from './CategoryForm';
import { Modal } from '@/shared';
import { Button } from '@/shared/ui/button';
import { useAuth, UserRole } from '@/core/auth';
import { Edit2, Trash2, Plus, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CategoryListProps { sportId: number; }

export function CategoryList({ sportId }: CategoryListProps) {
    const { data: categories, isLoading, error } = useCategories(sportId);
    const { mutate: deleteCategory } = useDeleteCategory(sportId);
    const { role } = useAuth();
    const isAdmin = role === UserRole.ADMIN;
    const t = useTranslations('sports.categories');
    const tCommon = useTranslations('common');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

    const handleCreate = () => { setEditingCategory(undefined); setIsModalOpen(true); };
    const handleEdit = (cat: Category) => { setEditingCategory(cat); setIsModalOpen(true); };
    const handleDelete = (id: number) => { if (window.confirm(t('deleteCategoryConfirm'))) deleteCategory({ category_id: id }); };
    const closeModal = () => { setIsModalOpen(false); setEditingCategory(undefined); };

    if (isLoading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}</div>;
    if (error) return <div className="p-4 text-destructive">{t('failedToLoad')}</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" />{t('title')}</h3>
                {isAdmin && <Button onClick={handleCreate} size="sm" className="gap-2"><Plus className="w-4 h-4" />{t('addCategory')}</Button>}
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="p-4 font-semibold text-sm">{t('categoryName')}</th>
                            <th className="p-4 font-semibold text-sm">{t('gender')}</th>
                            <th className="p-4 font-semibold text-sm">{t('ageRange')}</th>
                            {isAdmin && <th className="p-4 font-semibold text-sm text-right">{tCommon('actions')}</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {categories?.map((cat) => (
                            <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-4 text-sm font-medium">{cat.category}</td>
                                <td className="p-4"><GenderBadge gender={cat.gender} /></td>
                                <td className="p-4 text-sm text-muted-foreground">
                                    {cat.age_min || cat.age_max ? `${cat.age_min || 0} - ${cat.age_max || '∞'} ${t('years')}` : t('noAgeLimit')}
                                </td>
                                {isAdmin && (
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(cat)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(cat.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {categories?.length === 0 && (
                            <tr><td colSpan={isAdmin ? 4 : 3} className="p-8 text-center text-muted-foreground text-sm">{t('noCategories')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isAdmin && (
                <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCategory ? t('editCategory') : t('addCategory')}>
                    <CategoryForm sportId={sportId} category={editingCategory} onSuccess={closeModal} onCancel={closeModal} />
                </Modal>
            )}
        </div>
    );
}

function GenderBadge({ gender }: { gender: Gender | null | undefined }) {
    const t = useTranslations('sports.categories.genders');
    if (!gender) return <span className="text-xs text-muted-foreground italic">{t('any')}</span>;
    const config = {
        [Gender.MALE]: { label: t('male'), className: 'bg-blue-100 text-blue-700 border-blue-200' },
        [Gender.FEMALE]: { label: t('female'), className: 'bg-pink-100 text-pink-700 border-pink-200' },
        [Gender.OTHER]: { label: t('other'), className: 'bg-purple-100 text-purple-700 border-purple-200' },
    };
    const { label, className } = config[gender] || { label: gender, className: 'bg-secondary' };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${className}`}>{label}</span>;
}

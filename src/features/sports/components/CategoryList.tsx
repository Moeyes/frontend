'use client';

import { useState } from 'react';
import { Category, Gender } from '../types';
import { useCategories, useDeleteCategory } from '../hooks';
import { CategoryForm } from './CategoryForm';
import { Modal } from '@/shared/components';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context';
import { UserRole } from '@/features/auth/types';
import { Edit2, Trash2, Plus, Users } from 'lucide-react';

interface CategoryListProps {
    sportId: number;
}

export function CategoryList({ sportId }: CategoryListProps) {
    const { data: categories, isLoading, error } = useCategories(sportId);
    const { mutate: deleteCategory } = useDeleteCategory(sportId);
    const { role } = useAuth();
    const isAdmin = role === UserRole.ADMIN;
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

    const handleCreate = () => {
        setEditingCategory(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = (categoryId: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteCategory({ category_id: categoryId });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(undefined);
    };

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}
        </div>;
    }

    if (error) {
        return <div className="p-4 text-destructive">Failed to load categories.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Sport Categories
                </h3>
                {isAdmin && (
                    <Button onClick={handleCreate} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Category
                    </Button>
                )}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="p-4 font-semibold text-sm">Category Name</th>
                            <th className="p-4 font-semibold text-sm">Gender</th>
                            <th className="p-4 font-semibold text-sm">Age Range</th>
                            {isAdmin && <th className="p-4 font-semibold text-sm text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {categories?.map((cat) => (
                            <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-4 text-sm font-medium">{cat.category}</td>
                                <td className="p-4">
                                    <GenderBadge gender={cat.gender} />
                                </td>
                                <td className="p-4 text-sm text-muted-foreground">
                                    {cat.age_min || cat.age_max 
                                        ? `${cat.age_min || 0} - ${cat.age_max || '∞'} years`
                                        : 'No age limit'}
                                </td>
                                {isAdmin && (
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(cat)}
                                                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {categories?.length === 0 && (
                            <tr>
                                <td colSpan={isAdmin ? 4 : 3} className="p-8 text-center text-muted-foreground text-sm">
                                    No categories defined for this sport.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isAdmin && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={editingCategory ? 'Edit Category' : 'Add Category'}
                >
                    <CategoryForm
                        sportId={sportId}
                        category={editingCategory}
                        onSuccess={closeModal}
                        onCancel={closeModal}
                    />
                </Modal>
            )}
        </div>
    );
}

function GenderBadge({ gender }: { gender: Gender | null | undefined }) {
    if (!gender) return <span className="text-xs text-muted-foreground italic">Mixed / Any</span>;

    const config = {
        [Gender.MALE]: { label: 'Male', className: 'bg-blue-100 text-blue-700 border-blue-200' },
        [Gender.FEMALE]: { label: 'Female', className: 'bg-pink-100 text-pink-700 border-pink-200' },
        [Gender.OTHER]: { label: 'Other', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    };

    const { label, className } = config[gender] || { label: gender, className: 'bg-secondary' };

    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${className}`}>
            {label}
        </span>
    );
}

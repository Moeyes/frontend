'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { User } from '@/core/auth';
import { UserRole } from '@/core/auth';
import { UserCreate } from '../types';
import { useCreateUser, useUpdateUser } from '../hooks';
import { Button } from '@/shared/ui/button';
import { TextInputField, SelectField } from '@/shared/form';

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().optional().or(z.literal('')),
  khmer_name: z.string().min(2, 'Khmer name is required'),
  english_name: z.string().min(2, 'English name is required'),
  role: z.nativeEnum(UserRole),
  org_id: z.any().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
    const isEditing = !!user;
    const { mutate: create, isPending: isCreating } = useCreateUser();
    const { mutate: update, isPending: isUpdating } = useUpdateUser();

    const { control, handleSubmit, formState: { errors } } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: user ? {
            username: user.username,
            email: user.email,
            khmer_name: user.khmer_name,
            english_name: user.english_name,
            role: user.role,
            org_id: user.org_id?.toString() || '',
        } : {
            role: UserRole.GUEST,
            username: '',
            email: '',
            khmer_name: '',
            english_name: '',
            password: '',
            org_id: '',
        }
    });

    const onSubmit = (data: UserFormValues) => {
        const payload = {
            ...data,
            org_id: data.org_id ? Number(data.org_id) : null,
        };

        if (isEditing) {
            update({
                id: user.id,
                ...payload,
            }, {
                onSuccess: () => onSuccess(),
            });
        } else {
            create({
                ...payload,
                username: data.username,
                email: data.email,
                khmer_name: data.khmer_name,
                english_name: data.english_name,
                role: data.role,
                password: data.password || 'password123',
            } as UserCreate, {
                onSuccess: () => onSuccess(),
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <TextInputField
                control={control}
                name="username"
                label="Username"
                required
                error={errors.username?.message}
            />
            <TextInputField
                control={control}
                name="email"
                label="Email"
                type="email"
                required
                error={errors.email?.message}
            />
            {!isEditing && (
                <TextInputField
                    control={control}
                    name="password"
                    label="Password"
                    type="password"
                    required
                    error={errors.password?.message}
                />
            )}
            <div className="grid grid-cols-2 gap-4">
                <TextInputField
                    control={control}
                    name="khmer_name"
                    label="Khmer Name"
                    required
                    error={errors.khmer_name?.message}
                />
                <TextInputField
                    control={control}
                    name="english_name"
                    label="English Name"
                    required
                    error={errors.english_name?.message}
                />
            </div>
            
            <SelectField
                control={control}
                name="role"
                label="Role"
                required
                options={[
                    { value: UserRole.ADMIN, label: 'Admin' },
                    { value: UserRole.ORGANIZATION, label: 'Organization (User1)' },
                    { value: UserRole.FEDERATION, label: 'Federation (User2)' },
                    { value: UserRole.GUEST, label: 'Guest' },
                ]}
                error={errors.role?.message}
            />

            <TextInputField
                control={control}
                name="org_id"
                label="Organization ID (Optional)"
                type="number"
                error={errors.org_id?.message as string}
            />

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                    {isCreating || isUpdating ? 'Saving...' : isEditing ? 'Update User' : 'Create User'}
                </Button>
            </div>
        </form>
    );
}

/**
 * ParticipationForm Component
 */

'use client';

import { useForm } from 'react-hook-form';
import { useParticipationMutation } from '../hooks';
import { ParticipationPerSportPayload } from '../types';
import { Button } from '@/components/ui/button';

interface ParticipationFormProps {
    onSuccess?: () => void;
}

export function ParticipationForm({ onSuccess }: ParticipationFormProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ParticipationPerSportPayload>();
    const { create, isCreating } = useParticipationMutation();

    const onSubmit = (data: ParticipationPerSportPayload) => {
        create(data, {
            onSuccess: () => {
                reset();
                onSuccess?.();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-bold text-foreground">Add Participation</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Enroll ID *</label>
                    <input 
                        type="number" 
                        {...register('enroll_id', { required: 'Required', valueAsNumber: true })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                    {errors.enroll_id && <p className="text-[10px] text-error">{errors.enroll_id.message}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Event ID *</label>
                    <input 
                        type="number" 
                        {...register('event_id', { required: 'Required', valueAsNumber: true })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                    {errors.event_id && <p className="text-[10px] text-error">{errors.event_id.message}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Sport ID *</label>
                    <input 
                        type="number" 
                        {...register('sport_id', { required: 'Required', valueAsNumber: true })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                    {errors.sport_id && <p className="text-[10px] text-error">{errors.sport_id.message}</p>}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Category ID</label>
                    <input 
                        type="number" 
                        {...register('category_id', { valueAsNumber: true })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                    />
                </div>
            </div>

            <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating ? 'Saving...' : 'Save Participation'}
            </Button>
        </form>
    );
}

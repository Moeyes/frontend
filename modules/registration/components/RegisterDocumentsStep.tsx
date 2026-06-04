'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData, RegisterFormInput } from '../schema/registration.schema';
import { FileUploadField } from '@/shared/form';
import { uploadPhoto, uploadDocument } from '@/core/lib/upload/cloudinary';
import { useTranslations } from 'next-intl';
import { Camera, AlertCircle } from 'lucide-react';
import { eventsRepository } from '@/modules/events/adapters';

interface RegisterDocumentsStepProps {
    form: UseFormReturn<RegisterFormInput, unknown, RegisterFormData>;
}

export function RegisterDocumentsStep({ form }: RegisterDocumentsStepProps) {
    const { control, formState } = form;
    const t = useTranslations('registration.fields');

    return (
        <div className="space-y-8">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 p-8">
                <Camera className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-base font-semibold leading-snug text-foreground">
                    {t('profilePhoto')}
                </h3>
                <p className="mb-6 text-center text-sm leading-relaxed text-muted-foreground">
                    {t('photoUploadDesc')}
                </p>
                <div className="w-full max-w-sm">
                    <FileUploadField
                        control={control}
                        name="photoPath"
                        label=""
                        accept="image/*"
                        maxSize={2}
                        onUpload={uploadPhoto}
                        required
                        error={formState.errors.photoPath?.message}
                    />
                </div>
            </div>
            <div>
                <Under18Note form={form} />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FileUploadField
                        control={control}
                        name="nationalIdPath"
                        label={t('idDocument')}
                        accept="image/*,.pdf"
                        maxSize={5}
                        onUpload={uploadDocument}
                    />
                    <FileUploadField
                        control={control}
                        name="birthCertificatePath"
                        label={t('birthCertificate')}
                        accept="image/*,.pdf"
                        maxSize={5}
                        onUpload={uploadDocument}
                    />
                </div>
            </div>
        </div>
    );
}

function Under18Note({
    form,
}: {
    form: UseFormReturn<RegisterFormInput, unknown, RegisterFormData>;
}) {
    const [ageAtEvent, setAgeAtEvent] = useState<number | null>(null);
    const eventId = form.watch('eventId');
    const dob = form.watch('dateOfBirth');
    const t = useTranslations('registration.fields');

    useEffect(() => {
        let active = true;
        if (!dob || !eventId) return;
        (async () => {
            try {
                const event = await eventsRepository.getById(Number(eventId));
                if (!active) return;
                const evDateStr =
                    (event as { start_date?: string }).start_date ||
                    new Date().toISOString();
                const birth = new Date(dob);
                const evDate = new Date(evDateStr);
                let age = evDate.getFullYear() - birth.getFullYear();
                if (
                    evDate.getMonth() < birth.getMonth() ||
                    (evDate.getMonth() === birth.getMonth() &&
                        evDate.getDate() < birth.getDate())
                )
                    age--;
                setAgeAtEvent(age);
            } catch {
                // ignore errors silently
            }
        })();
        return () => {
            active = false;
        };
    }, [dob, eventId, form]);

    if (ageAtEvent === null) return null;
    if (ageAtEvent < 18) {
        return (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <p className="text-sm font-medium leading-relaxed text-foreground">
                    {t('under18BirthCert')}
                </p>
            </div>
        );
    }
    return null;
}

'use client';

import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData, RegisterFormInput } from '../services/schema';
import { TextInputField, SelectField, FileUploadField, SelectOption } from '@/shared/form';
import { uploadPhoto, uploadDocument } from '@/core/lib/upload/cloudinary';
import { type CascadingDataLoaded, type CategoryReference as Category } from '@/core/lib/reference-data';
import { GENDER_OPTIONS, ID_DOCUMENT_OPTIONS, ROLE_OPTIONS, LEADER_ROLE_OPTIONS } from '@/core/config/constants';
import { Calendar, User, Trophy, Building2, CheckCircle2, Camera, Users } from 'lucide-react';
import { useAuth, UserRole } from '@/core/auth';
import { useTranslations } from 'next-intl';

type FormStep = 'event' | 'category' | 'personal' | 'documents' | 'review';

interface RegisterFormFieldsProps {
    form: UseFormReturn<RegisterFormInput, unknown, RegisterFormData>;
    cascadingData: CascadingDataLoaded | null;
    categories: Category[];
    step: FormStep;
}

const ReviewField = ({ label, value }: { label: string; value: string | null | undefined }) => (
    <div className="flex flex-col">
        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value || '—'}</p>
    </div>
);

export function RegisterFormFields({ form, cascadingData, categories, step }: RegisterFormFieldsProps) {
    const { user } = useAuth();
    const { control, formState, watch } = form;
    const t = useTranslations('registration.fields');
    const tReview = useTranslations('registration.review');
    const selectedRole = watch('role');
    const selectedEventType = watch('eventType');
    const isAdmin = user?.role === UserRole.ADMIN;

    const eventTypeOptions: SelectOption[] = cascadingData?.eventTypes.map((type) => ({ value: type, label: type })) || [];
    const filteredEvents = selectedEventType ? cascadingData?.events.filter((e) => e.type === selectedEventType) || [] : [];
    const eventOptions: SelectOption[] = filteredEvents.map((e) => ({ value: String(e.id), label: e.name_kh || e.name_en || `Event ${e.id}` }));
    const orgOptions: SelectOption[] = cascadingData?.organizations.map((o) => ({ value: String(o.id), label: o.name_kh || o.name_en || `Org ${o.id}` })) || [];
    const sportOptions: SelectOption[] = cascadingData?.sports.map((s) => ({ value: String(s.id), label: s.name_kh || s.name_en || `Sport ${s.id}` })) || [];
    const categoryOptions: SelectOption[] = categories.map((c) => ({ value: String(c.id), label: c.category }));

    if (step === 'event') {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                            <Trophy className="w-4 h-4 text-primary" />{t('eventType')} <span className="text-error">*</span>
                        </label>
                        <SelectField control={control} name="eventType" label="" placeholder={t('selectEventType')} options={eventTypeOptions} required error={formState.errors.eventType?.message} />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                            <Calendar className="w-4 h-4 text-primary" />{t('event')} <span className="text-error">*</span>
                        </label>
                        <SelectField control={control} name="eventId" label="" placeholder={t('selectEvent')} options={eventOptions} required error={formState.errors.eventId?.message} />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                            <Building2 className="w-4 h-4 text-primary" />{t('organization')} <span className="text-error">*</span>
                        </label>
                        <SelectField control={control} name="organizationId" label="" placeholder={t('selectOrganization')} options={orgOptions} required disabled={!isAdmin} error={formState.errors.organizationId?.message} />
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                            <Trophy className="w-4 h-4 text-primary" />{t('sport')} <span className="text-error">*</span>
                        </label>
                        <SelectField control={control} name="sportId" label="" placeholder={t('selectSport')} options={sportOptions} required error={formState.errors.sportId?.message} />
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'category') {
        return (
            <div className="space-y-6">
                <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-2">
                        <Users className="w-4 h-4 text-primary" />{t('category')} <span className="text-error">*</span>
                    </label>
                    <SelectField control={control} name="categoryId" label=""
                        placeholder={categoryOptions.length === 0 ? t('noCategories') : t('selectCategory')}
                        options={categoryOptions} required error={formState.errors.categoryId?.message} />
                </div>
            </div>
        );
    }

    if (step === 'personal') {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">{t('fullNameKhmer')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <TextInputField control={control} name="khFamilyName" label={t('familyName')} placeholder="គ្រាម" required lang="km" />
                            <TextInputField control={control} name="khGivenName" label={t('givenName')} placeholder="នាម" required lang="km" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary">{t('fullNameEnglish')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <TextInputField control={control} name="enFamilyName" label={t('familyName')} placeholder="Last Name" required />
                            <TextInputField control={control} name="enGivenName" label={t('givenName')} placeholder="First Name" required />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <SelectField control={control} name="gender" label={t('gender')} options={[...GENDER_OPTIONS]} required />
                    <TextInputField control={control} name="dateOfBirth" label={t('dateOfBirth')} type="date" required />
                    <TextInputField control={control} name="phone" label={t('phone')} placeholder="012345678" required />
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <TextInputField control={control} name="nationality" label={t('nationality')} placeholder={t('nationalityPlaceholder')} required />
                    <SelectField control={control} name="idDocumentType" label={t('idType')} options={[...ID_DOCUMENT_OPTIONS]} required />
                </div>
                <TextInputField control={control} name="address" label={t('address')} placeholder={t('addressPlaceholder')} />
                <div className="pt-4 border-t border-border">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <SelectField control={control} name="role" label={t('role')} options={[...ROLE_OPTIONS]} required />
                        {selectedRole === 'leader' && (
                            <SelectField control={control} name="leaderRole" label={t('leaderRole')} options={[...LEADER_ROLE_OPTIONS]} required />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'documents') {
        return (
            <div className="space-y-8">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-secondary/20">
                    <Camera className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-bold text-foreground mb-2">{t('profilePhoto')}</h3>
                    <p className="text-sm text-muted-foreground text-center mb-6">{t('photoUploadDesc')}</p>
                    <div className="w-full max-w-sm">
                        <FileUploadField control={control} name="photoPath" label="" accept="image/*" maxSize={2} onUpload={uploadPhoto} required error={formState.errors.photoPath?.message} />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FileUploadField control={control} name="nationalIdPath" label={t('idDocument')} accept="image/*,.pdf" maxSize={5} onUpload={uploadDocument} />
                    <FileUploadField control={control} name="birthCertificatePath" label={t('birthCertificate')} accept="image/*,.pdf" maxSize={5} onUpload={uploadDocument} />
                </div>
            </div>
        );
    }

    if (step === 'review') {
        const formData = form.getValues();
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                            <Trophy className="w-4 h-4" />{tReview('eventDetails')}
                        </h3>
                        <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
                            <ReviewField label={t('event')} value={eventOptions.find(o => o.value === String(formData.eventId))?.label} />
                            <ReviewField label={t('organization')} value={orgOptions.find(o => o.value === String(formData.organizationId))?.label} />
                            <ReviewField label={t('sport')} value={sportOptions.find(o => o.value === String(formData.sportId))?.label} />
                            <ReviewField label={t('category')} value={categoryOptions.find(o => o.value === String(formData.categoryId))?.label} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                            <User className="w-4 h-4" />{tReview('personalInfo')}
                        </h3>
                        <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
                            <ReviewField label={tReview('khmerName')} value={`${formData.khFamilyName} ${formData.khGivenName}`} />
                            <ReviewField label={tReview('englishName')} value={`${formData.enFamilyName} ${formData.enGivenName}`} />
                            <ReviewField label={tReview('gender')} value={formData.gender} />
                            <ReviewField label={tReview('phone')} value={formData.phone} />
                            <ReviewField label={tReview('role')} value={formData.role === 'leader' ? tReview('leader', { leaderRole: formData.leaderRole || '' }) : tReview('athlete')} />
                        </div>
                    </div>
                </div>
                {formData.photoPath && (
                    <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <span className="text-sm font-bold text-success">{t('photoUploaded')}</span>
                    </div>
                )}
            </div>
        );
    }

    return null;
}

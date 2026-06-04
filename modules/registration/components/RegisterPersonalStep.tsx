'use client';

import { UseFormReturn } from 'react-hook-form';
import { RegisterFormData, RegisterFormInput } from '../schema/registration.schema';
import { TextInputField, SelectField } from '@/shared/form';
import { useTranslations } from 'next-intl';
import { Users } from 'lucide-react';
import {
    GENDER_OPTIONS,
    ID_DOCUMENT_OPTIONS,
    ROLE_OPTIONS,
    LEADER_ROLE_OPTIONS,
} from '@/core/config/constants';

interface RegisterPersonalStepProps {
    form: UseFormReturn<RegisterFormInput, unknown, RegisterFormData>;
    mode?: 'athlete' | 'leader';
}

export function RegisterPersonalStep({ form, mode = 'athlete' }: RegisterPersonalStepProps) {
    const isLeader = mode === 'leader';
    const { control, formState, watch } = form;
    const t = useTranslations('registration.fields');
    const selectedRole = watch('role');

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold leading-snug text-foreground">
                        {t('fullNameKhmer')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <TextInputField
                            control={control}
                            name="khFamilyName"
                            label={t('familyName')}
                            placeholder="គ្រាម"
                            required
                            lang="km"
                        />
                        <TextInputField
                            control={control}
                            name="khGivenName"
                            label={t('givenName')}
                            placeholder="នាម"
                            required
                            lang="km"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold leading-snug text-foreground">
                        {t('fullNameEnglish')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <TextInputField
                            control={control}
                            name="enFamilyName"
                            label={t('familyName')}
                            placeholder="Last Name"
                            required
                        />
                        <TextInputField
                            control={control}
                            name="enGivenName"
                            label={t('givenName')}
                            placeholder="First Name"
                            required
                        />
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <SelectField
                    control={control}
                    name="gender"
                    label={t('gender')}
                    options={[...GENDER_OPTIONS]}
                    required
                />
                <TextInputField
                    control={control}
                    name="dateOfBirth"
                    label={t('dateOfBirth')}
                    type="date"
                    required
                />
                <TextInputField
                    control={control}
                    name="phone"
                    label={t('phone')}
                    placeholder="012345678"
                    required
                />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <TextInputField
                    control={control}
                    name="nationality"
                    label={t('nationality')}
                    placeholder={t('nationalityPlaceholder')}
                    required
                />
                <SelectField
                    control={control}
                    name="idDocumentType"
                    label={t('idType')}
                    options={[...ID_DOCUMENT_OPTIONS]}
                    required
                />
            </div>
            <TextInputField
                control={control}
                name="address"
                label={t('address')}
                placeholder={t('addressPlaceholder')}
            />
            <div className="pt-4 border-t border-border">
                {isLeader ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium leading-relaxed text-foreground">
                                {t('role')}
                            </label>
                            <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm font-medium text-foreground">
                                <Users className="h-4 w-4 text-primary" />
                                {ROLE_OPTIONS.find((o) => o.value === 'leader')?.label ??
                                    'Leader'}
                            </div>
                        </div>
                        <SelectField
                            control={control}
                            name="leaderRole"
                            label={t('leaderRole')}
                            options={[...LEADER_ROLE_OPTIONS]}
                            required
                            error={formState.errors.leaderRole?.message}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <SelectField
                            control={control}
                            name="role"
                            label={t('role')}
                            options={[...ROLE_OPTIONS]}
                            required
                        />
                        {selectedRole === 'leader' && (
                            <SelectField
                                control={control}
                                name="leaderRole"
                                label={t('leaderRole')}
                                options={[...LEADER_ROLE_OPTIONS]}
                                required
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

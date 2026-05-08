'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { TextInputField, SelectField, DateField } from '@/shared/form';
import { Button } from '@/shared/ui';
import { personalInfoStepSchema, type PersonalInfoStepValues } from '../services/schema';

interface PersonalInfoStepProps {
  defaultValues?: Partial<PersonalInfoStepValues>;
  onNext: (values: PersonalInfoStepValues) => void;
  onBack: () => void;
}

export function PersonalInfoStep({ defaultValues, onNext, onBack }: PersonalInfoStepProps) {
  const t  = useTranslations('registration');
  const tc = useTranslations('common');

  const form = useForm<PersonalInfoStepValues>({
    resolver: zodResolver(personalInfoStepSchema),
    defaultValues: { gender: 'MALE', ...defaultValues },
  });

  const genderOptions = [
    { value: 'MALE',   label: tc('male') },
    { value: 'FEMALE', label: tc('female') },
  ];

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <TextInputField control={form.control} name="kh_family_name" labelKey="registration.fields.familyName" required />
        <TextInputField control={form.control} name="kh_given_name"  labelKey="registration.fields.givenName"  required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextInputField control={form.control} name="en_family_name" labelKey="registration.fields.familyName" required />
        <TextInputField control={form.control} name="en_given_name"  labelKey="registration.fields.givenName"  required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SelectField control={form.control} name="gender" labelKey="registration.fields.gender" options={genderOptions} required />
        <DateField  control={form.control} name="date_of_birth" labelKey="registration.fields.dateOfBirth" required />
      </div>
      <TextInputField control={form.control} name="phone"   labelKey="registration.fields.phone" />
      <TextInputField control={form.control} name="address" labelKey="registration.fields.address" />

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" onClick={onBack}>← {tc('back')}</Button>
        <Button type="submit">{tc('next')} →</Button>
      </div>
    </form>
  );
}

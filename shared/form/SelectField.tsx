'use client';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { Select } from '@/shared/ui/Select';
import type { SelectOption } from '@/shared/ui/Select';
import { FormField } from './FormField';
import { useTranslations } from 'next-intl';

interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  labelKey?: string;
  label?: string;
  placeholderKey?: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  labelKey,
  label,
  placeholderKey,
  placeholder,
  options,
  required,
  disabled,
}: SelectFieldProps<T>) {
  const t = useTranslations();
  const resolvedPlaceholder = placeholder ?? (placeholderKey ? t(placeholderKey) : undefined);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          labelKey={labelKey}
          label={label}
          error={fieldState.error}
          required={required}
        >
          <Select
            value={field.value ?? ''}
            onValueChange={field.onChange}
            options={options}
            placeholder={resolvedPlaceholder}
            disabled={disabled}
          />
        </FormField>
      )}
    />
  );
}

'use client';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { Input } from '@/shared/ui/Input';
import { FormField } from './FormField';

interface DateFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  labelKey?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
}

export function DateField<T extends FieldValues>({
  control,
  name,
  labelKey,
  label,
  required,
  disabled,
  min,
  max,
}: DateFieldProps<T>) {
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
          <Input
            {...field}
            type="date"
            disabled={disabled}
            min={min}
            max={max}
            aria-invalid={!!fieldState.error}
          />
        </FormField>
      )}
    />
  );
}

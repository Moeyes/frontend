'use client';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { Input } from '@/shared/ui/Input';
import { FormField } from './FormField';

interface TextInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  labelKey?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
}

export function TextInputField<T extends FieldValues>({
  control,
  name,
  labelKey,
  label,
  placeholder,
  type = 'text',
  required,
  disabled,
  hint,
}: TextInputFieldProps<T>) {
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
          hint={hint}
        >
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
          />
        </FormField>
      )}
    />
  );
}

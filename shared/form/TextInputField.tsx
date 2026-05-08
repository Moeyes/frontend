'use client';
import type { ReactNode } from 'react';
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
  autoComplete?: string;
  autoFocus?: boolean;
  rightElement?: ReactNode;
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
  autoComplete,
  autoFocus,
  rightElement,
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
          {rightElement ? (
            <div className="relative">
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                aria-invalid={!!fieldState.error}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {rightElement}
              </div>
            </div>
          ) : (
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              autoComplete={autoComplete}
              autoFocus={autoFocus}
              aria-invalid={!!fieldState.error}
            />
          )}
        </FormField>
      )}
    />
  );
}

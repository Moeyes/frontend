'use client';
import type { ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Label } from '@/shared/ui/Label';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label?: string;
  labelKey?: string;
  error?: FieldError | { message?: string };
  required?: boolean;
  children: ReactNode;
  className?: string;
  hint?: string;
}

export function FormField({
  label,
  labelKey,
  error,
  required,
  children,
  className,
  hint,
}: FormFieldProps) {
  const t = useTranslations();
  const resolvedLabel = label ?? (labelKey ? t(labelKey) : undefined);
  const errorMsg = error?.message
    ? error.message.includes('.')
      ? t(error.message as Parameters<typeof t>[0])
      : error.message
    : undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      {resolvedLabel && (
        <Label>
          {resolvedLabel}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {hint && !errorMsg && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {errorMsg && (
        <p className="text-xs text-destructive" role="alert">
          {errorMsg}
        </p>
      )}
    </div>
  );
}

'use client';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FormField } from './FormField';
import { Button } from '@/shared/ui/Button';
import { Spinner } from '@/shared/ui/Spinner';
import { cn } from '@/lib/utils';

interface FileUploadFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  labelKey?: string;
  label?: string;
  required?: boolean;
  accept?: string;
  onUpload: (file: File) => Promise<string>;
}

export function FileUploadField<T extends FieldValues>({
  control, name, labelKey, label, required, accept = 'image/*,.pdf', onUpload,
}: FileUploadFieldProps<T>) {
  const t = useTranslations('common');
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField labelKey={labelKey} label={label} error={fieldState.error} required={required}>
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setIsUploading(true);
                try {
                  const url = await onUpload(file);
                  field.onChange(url);
                } catch {
                  field.onChange('');
                } finally {
                  setIsUploading(false);
                }
              }}
            />
            <Button type="button" variant="outline" size="sm" disabled={isUploading}
              onClick={() => inputRef.current?.click()}>
              {isUploading && <Spinner className="mr-2 h-4 w-4" />}
              {isUploading ? t('uploading') : t('selectFile')}
            </Button>
            {field.value && (
              <span className={cn('text-sm truncate max-w-[200px]',
                isUploading ? 'text-muted-foreground' : 'text-green-600')}>
                {isUploading ? t('uploading') : t('fileUploaded')}
              </span>
            )}
          </div>
        </FormField>
      )}
    />
  );
}

import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FormField } from './FormField';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    required?: boolean;
    placeholder?: string;
    options: SelectOption[];
    error?: string;
    hint?: string;
    htmlFor?: string;
}

/**
 * Reusable select field with validation
 */
export function SelectField<T extends FieldValues>({
    control,
    name,
    label,
    required = false,
    placeholder = 'Select an option',
    options,
    error,
    hint,
    htmlFor,
}: SelectFieldProps<T>) {
    const fieldId = htmlFor || name;

    return (
        <Controller
            control={control}
            name={name}
            render={({ field }) => {
                const selectedValue = field.value ?? '';
                const selectedLabel = options.find(opt => opt.value === String(selectedValue))?.label || placeholder;

                return (
                    <FormField
                        label={label}
                        required={required}
                        error={error}
                        hint={hint}
                        htmlFor={fieldId}
                    >
                        <Select value={selectedValue} onValueChange={field.onChange}>
                            <SelectTrigger
                                id={fieldId}
                                className={error ? 'border-destructive' : ''}
                            >
                                <SelectValue placeholder={placeholder}>
                                    {selectedLabel}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                );
            }}
        />
    );
}

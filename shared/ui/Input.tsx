import { forwardRef } from 'react';
import { Input as ShadInput } from '@/components/ui/input';

export const Input = forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  (props, ref) => <ShadInput ref={ref} {...props} />
);
Input.displayName = 'Input';

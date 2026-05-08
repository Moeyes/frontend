import { forwardRef } from 'react';
import { Textarea as ShadTextarea } from '@/components/ui/textarea';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<typeof ShadTextarea>
>((props, ref) => <ShadTextarea ref={ref} {...props} />);
Textarea.displayName = 'Textarea';

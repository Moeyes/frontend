import { forwardRef } from 'react';
import { Label as ShadLabel } from '@/components/ui/label';

export const Label = forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(
  (props, ref) => <ShadLabel ref={ref} {...props} />
);
Label.displayName = 'Label';

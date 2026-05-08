import { Badge as ShadBadge } from '@/components/ui/badge';
import type { badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

export type BadgeVariant = VariantProps<typeof badgeVariants>['variant'];

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = 'default', ...props }: BadgeProps) {
  return <ShadBadge variant={variant} {...props} />;
}

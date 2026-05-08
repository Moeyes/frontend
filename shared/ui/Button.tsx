import { forwardRef } from 'react';
import { Button as ShadButton, type buttonVariants } from '@/components/ui/button';
import { Spinner } from './Spinner';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ loading, disabled, children, className, ...props }, ref) => (
    <ShadButton
      ref={ref}
      disabled={disabled || loading}
      className={cn(className)}
      {...props}
    >
      {loading && <Spinner className="mr-2 h-4 w-4" />}
      {children}
    </ShadButton>
  )
);
Button.displayName = 'Button';

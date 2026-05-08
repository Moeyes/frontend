import { cn } from '@/lib/utils';

interface Step {
  key: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <nav aria-label="Progress" className="flex items-center gap-2">
      {steps.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                isDone && 'bg-primary text-primary-foreground',
                isCurrent && 'border-2 border-primary text-primary',
                !isDone && !isCurrent && 'border-2 border-muted text-muted-foreground'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {isDone ? '✓' : idx + 1}
            </div>
            <span
              className={cn(
                'text-sm hidden sm:block',
                isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-6 mx-1',
                  idx < currentIdx ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}

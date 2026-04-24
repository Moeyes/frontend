"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps<T extends string = string> {
  steps: readonly T[];
  currentStep: T;
  onStepClick?: (step: T) => void;
  totalSteps?: number;
}

export function StepIndicator<T extends string = string>({
  steps,
  currentStep,
  onStepClick,
  totalSteps,
}: StepIndicatorProps<T>) {
  const currentStepIndex = steps.indexOf(currentStep);
  const total = totalSteps || steps.length;
  const progress = ((currentStepIndex + 1) / total) * 100;

  return (
    <div className="mb-8 bg-card border border-border p-6 rounded-2xl shadow-sm">
      {/* Progress Label */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Current Step</p>
          <h2 className="text-xl font-black text-primary uppercase">
            {currentStep}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Progress</p>
          <p className="text-sm font-black text-foreground">
            {currentStepIndex + 1} <span className="text-muted-foreground">/</span> {total}
          </p>
        </div>
      </div>

      {/* Step Circles & Connectors */}
      <div className="flex items-center justify-between mb-6 relative">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -translate-y-1/2 z-0 rounded-full" />
        
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isCompleted = index < currentStepIndex;

          return (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <button
                onClick={() => onStepClick?.(step)}
                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full font-black text-xs transition-all duration-300 cursor-pointer ${isActive
                  ? "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20 scale-110"
                  : isCompleted
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-background text-muted-foreground border-2 border-border"
                  }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3px]" />
                ) : (
                  index + 1
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Labels */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <p
            key={index}
            className={`text-[10px] font-black uppercase tracking-wider transition-colors max-w-[80px] text-center ${index <= currentStepIndex
              ? "text-primary"
              : "text-muted-foreground"
              }`}
          >
            {step}
          </p>
        ))}
      </div>
    </div>
  );
}

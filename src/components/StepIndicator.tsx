"use client";

import React from "react";
import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({
  steps,
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      {/* Progress Label */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-primary">
          {steps[currentStep - 1] || ""}
        </h2>
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Step Circles & Connectors */}
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20"
                    : isCompleted
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground border-2 border-border"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-colors duration-200 ${
                    stepNumber < currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Labels */}
      <div className="flex justify-between mt-4">
        {steps.map((step, index) => (
          <p
            key={index}
            className={`text-xs font-medium transition-colors ${
              index + 1 <= currentStep
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

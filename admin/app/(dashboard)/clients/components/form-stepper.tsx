"use client";

interface Step {
  number: number;
  title: string;
  description?: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
}

export function FormStepper({ steps, currentStep, completedSteps = [] }: FormStepperProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = completedSteps.includes(step.number);
          const isPast = step.number < currentStep;

          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : isCompleted || isPast
                        ? "bg-primary/10 text-primary border-primary"
                        : "bg-background text-muted-foreground border-muted"
                    }`}
                  >
                    {isCompleted || isPast ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${
                        isCompleted || isPast ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
                <div className="mt-2 text-center max-w-[120px]">
                  <p
                    className={`text-xs font-medium ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </p>
      </div>
    </div>
  );
}

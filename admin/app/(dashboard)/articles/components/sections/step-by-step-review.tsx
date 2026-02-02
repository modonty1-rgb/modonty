'use client';

import { Badge } from '@/components/ui/badge';
import { useArticleForm } from '../article-form-context';
import { STEP_CONFIGS, getMissingRequiredFields } from '../../helpers/step-validation-helpers';
import { StepReviewCard } from '../steps/step-review-card';

export function StepByStepReview() {
  const { formData, getStepValidation } = useArticleForm();

  const reviewSteps = STEP_CONFIGS.slice(0, 6); // Steps 1-6 (excluding step 7)

  const stepValidations = reviewSteps.map((step) => ({
    step,
    validation: getStepValidation(step.number),
    missingFields: getMissingRequiredFields(step.number, formData),
  }));

  const fullyCompletedSteps = stepValidations.filter(
    (s) => s.validation.isValid && s.validation.completionPercentage === 100
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-foreground">Step-by-Step Review</h2>
        <Badge variant="secondary" className="text-xs">
          {fullyCompletedSteps}/{reviewSteps.length} complete
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Review each step below. Expand any step to see detailed field information and validation status.
      </p>

      <div className="space-y-4">
        {stepValidations.map(({ step, validation, missingFields }) => (
          <StepReviewCard
            key={step.id}
            stepNumber={step.number}
            stepConfig={step}
            validation={validation}
            formData={formData}
            missingFields={missingFields}
          />
        ))}
      </div>
    </div>
  );
}

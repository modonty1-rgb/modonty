'use client';

import { memo } from 'react';

import { BasicSection } from '../sections/basic-section';
import { SEOStep } from './seo-step';

export const BasicStep = memo(function BasicStep() {
  return (
    <div className="space-y-6">
      <BasicSection />
      <SEOStep />
    </div>
  );
});

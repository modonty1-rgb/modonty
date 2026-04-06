'use client';

import { memo } from 'react';

import { BasicSection } from '../sections/basic-section';

export const BasicStep = memo(function BasicStep() {
  return (
    <div className="space-y-6">
      <BasicSection />
    </div>
  );
});

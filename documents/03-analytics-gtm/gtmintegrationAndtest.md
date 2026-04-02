# GTM Integration & Testing Checklist

## Verification Steps

### 1. Data Layer Push

Verify data is pushed correctly to Data Layer on test site:
- Open DevTools in browser
- Navigate to Console
- Check data is pushed to dataLayer as expected

### 2. GTM Settings

In Google Tag Manager:
- Verify Variables (Variables) and Triggers set up correctly
- Use Preview Mode to verify data is captured
- Check data reaches GTM before publishing

### 3. Google Analytics Verification

Verify data reaches GA4:
- Check Real-Time Reports in GA4
- Verify events appear with custom dimensions
- Confirm everything arrives as expected

### 4. Reporting Dashboard

Check Looker Studio or other reporting tool:
- Verify data displays correctly
- Confirm Client IDs appear correctly
- Check reports show required details

## Summary

Complete verification ensures smooth data flow from start to finish through reporting pipeline.

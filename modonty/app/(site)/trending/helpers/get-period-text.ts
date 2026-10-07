// Helper function for period text
export const getPeriodText = (days: number) => {
  if (days === 7) return 'آخر 7 أيام';
  if (days === 14) return 'آخر 14 يوم';
  if (days === 30) return 'آخر 30 يوم';
  return `آخر ${days} يوم`;
};

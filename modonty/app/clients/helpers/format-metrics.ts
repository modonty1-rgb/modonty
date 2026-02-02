export function formatMetric(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function calculateEngagementScore(metrics: {
  views: number;
  comments: number;
  likes: number;
  subscribers: number;
}): number {
  const commentRate = metrics.views > 0 ? (metrics.comments / metrics.views) * 100 : 0;
  const likeRate = metrics.views > 0 ? (metrics.likes / metrics.views) * 100 : 0;
  const subscriberWeight = metrics.subscribers * 2;
  
  return Math.min(
    Math.round((commentRate * 40 + likeRate * 40 + subscriberWeight * 0.2) / 10),
    5
  );
}

export function getEngagementLabel(score: number): { label: string; color: string } {
  if (score >= 4.5) return { label: 'ممتاز', color: 'text-green-600' };
  if (score >= 3.5) return { label: 'جيد جداً', color: 'text-blue-600' };
  if (score >= 2.5) return { label: 'جيد', color: 'text-yellow-600' };
  if (score >= 1.5) return { label: 'متوسط', color: 'text-orange-600' };
  return { label: 'منخفض', color: 'text-gray-500' };
}

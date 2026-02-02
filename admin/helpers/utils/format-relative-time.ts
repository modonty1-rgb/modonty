export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return "الآن";
  } else if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} ${diffInMinutes === 1 ? "دقيقة" : "دقائق"}`;
  } else if (diffInHours < 24) {
    return `منذ ${diffInHours} ${diffInHours === 1 ? "ساعة" : "ساعات"}`;
  } else if (diffInDays === 1) {
    return "منذ يوم واحد";
  } else if (diffInDays < 7) {
    return `منذ ${diffInDays} ${diffInDays === 2 ? "يومين" : diffInDays < 11 ? "أيام" : "يوم"}`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `منذ ${weeks} ${weeks === 1 ? "أسبوع" : weeks === 2 ? "أسبوعين" : "أسابيع"}`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `منذ ${months} ${months === 1 ? "شهر" : months === 2 ? "شهرين" : "أشهر"}`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `منذ ${years} ${years === 1 ? "سنة" : years === 2 ? "سنتين" : "سنوات"}`;
  }
}
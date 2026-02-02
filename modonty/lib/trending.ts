/**
 * Trending Algorithm - Time-weighted scoring system
 * Similar to Reddit/Hacker News algorithm
 * 
 * Formula: (interactions) / (age + 2) ^ gravity
 * - Higher gravity = faster decay (trending items fall off faster)
 * - +2 prevents division by zero and gives new items a boost
 */

interface TrendingScore {
  score: number;
  interactions: number;
  ageInHours: number;
}

/**
 * Calculate trending score for an article
 * 
 * @param interactions - Total interactions (views + likes*2 + comments*3 + favorites*2)
 * @param createdAt - Article creation date
 * @param gravity - Decay rate (default: 1.8, higher = faster decay)
 * @returns Trending score (higher = more trending)
 */
export function calculateTrendingScore(
  interactions: {
    views: number;
    likes: number;
    comments: number;
    favorites: number;
  },
  createdAt: Date,
  gravity: number = 1.8
): TrendingScore {
  const now = Date.now();
  const articleTime = new Date(createdAt).getTime();
  const ageInHours = (now - articleTime) / (1000 * 60 * 60);

  // Weight different interaction types
  // Views = 1x, Likes = 2x, Comments = 3x, Favorites = 2x
  const totalInteractions =
    interactions.views +
    interactions.likes * 2 +
    interactions.comments * 3 +
    interactions.favorites * 2;

  // Time-weighted score
  // +2 prevents division by zero and gives new content a small boost
  const score = totalInteractions / Math.pow(ageInHours + 2, gravity);

  return {
    score,
    interactions: totalInteractions,
    ageInHours,
  };
}

/**
 * Calculate trending score with custom weights
 */
export function calculateCustomTrendingScore(
  interactions: {
    views: number;
    likes: number;
    comments: number;
    favorites: number;
  },
  createdAt: Date,
  weights: {
    views: number;
    likes: number;
    comments: number;
    favorites: number;
  } = { views: 1, likes: 2, comments: 3, favorites: 2 },
  gravity: number = 1.8
): number {
  const now = Date.now();
  const articleTime = new Date(createdAt).getTime();
  const ageInHours = (now - articleTime) / (1000 * 60 * 60);

  const totalInteractions =
    interactions.views * weights.views +
    interactions.likes * weights.likes +
    interactions.comments * weights.comments +
    interactions.favorites * weights.favorites;

  return totalInteractions / Math.pow(ageInHours + 2, gravity);
}

/**
 * Filter articles by minimum age (to avoid showing brand new articles)
 */
export function isEligibleForTrending(
  createdAt: Date,
  minAgeHours: number = 1
): boolean {
  const now = Date.now();
  const articleTime = new Date(createdAt).getTime();
  const ageInHours = (now - articleTime) / (1000 * 60 * 60);

  return ageInHours >= minAgeHours;
}

/**
 * Get trending time range (e.g., last 7 days)
 */
export function getTrendingTimeRange(days: number = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

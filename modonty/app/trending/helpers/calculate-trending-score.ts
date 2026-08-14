/**
 * Time-weighted trending score, in the Reddit/Hacker News shape:
 *
 *   score = interactions / (ageInHours + 2) ^ gravity
 *
 * Higher gravity makes an item fall off faster. The +2 both prevents a division by zero
 * on a just-published article and gives new content a small head start.
 */

export interface TrendingScore {
  score: number;
  interactions: number;
  ageInHours: number;
}

export interface TrendingInteractions {
  views: number;
  likes: number;
  comments: number;
  favorites: number;
}

/**
 * @param interactions raw counts; weighted below as views 1× · likes 2× · comments 3× · favorites 2×
 * @param createdAt    when the article was published
 * @param gravity      decay rate — higher falls off faster
 */
export function calculateTrendingScore(
  interactions: TrendingInteractions,
  createdAt: Date,
  gravity: number = 1.8
): TrendingScore {
  const now = Date.now();
  const articleTime = new Date(createdAt).getTime();
  const ageInHours = (now - articleTime) / (1000 * 60 * 60);

  // A comment costs more effort than a like, and a like more than a view — the weights
  // rank by effort so a page with many idle views does not outrank a discussed one.
  const totalInteractions =
    interactions.views +
    interactions.likes * 2 +
    interactions.comments * 3 +
    interactions.favorites * 2;

  const score = totalInteractions / Math.pow(ageInHours + 2, gravity);

  return {
    score,
    interactions: totalInteractions,
    ageInHours,
  };
}

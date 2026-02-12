/** Lighthouse CI config scoped to the modonty web app. */
module.exports = {
  ci: {
    collect: {
      // Run against your local production server on this URL.
      url: ['http://localhost:3000/'],
      // Multiple runs to smooth out randomness.
      numberOfRuns: 5,
      // We assume you start the server yourself (pnpm --filter @modonty/modonty start).
    },
    assert: {
      // Recommended default assertions from Lighthouse team.
      preset: 'lighthouse:recommended',
      // Soft guardrail for performance score; adjust later if you want.
      assertions: {
        'categories:performance': ['warn', { minScore: 0.6 }],
      },
    },
    upload: {
      // Uses temporary public storage so you get shareable report links,
      // but nothing is persisted in your repo.
      target: 'temporary-public-storage',
    },
  },
};


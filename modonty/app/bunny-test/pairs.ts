// TEMP (branch version-2 only — Bunny migration measurement). Delete with the whole /bunny-test route before merge.
// Same source assets uploaded to both CDNs (see scratchpad/bunny-cdn-test.mjs).
export interface TestPair {
  id: number;
  label: string;
  cloudinary: string;
  bunny: string;
}

export const PAIRS: TestPair[] = [
  {
    id: 1,
    label: "Modonty logo (PNG ~5KB)",
    cloudinary: "https://res.cloudinary.com/dfegnpgwx/image/upload/v1769683590/modontyLogo_ftf4yf.png",
    bunny: "https://modonty-clients.b-cdn.net/bunny-test/sample-1.png",
  },
  {
    id: 2,
    label: "Modonty avatar (WEBP ~74KB)",
    cloudinary: "https://res.cloudinary.com/dfegnpgwx/image/upload/v1770899986/modontyAvatar_gn8wxj.webp",
    bunny: "https://modonty-clients.b-cdn.net/bunny-test/sample-2.webp",
  },
  {
    id: 3,
    label: "Jabr logo (PNG ~47KB)",
    cloudinary: "https://res.cloudinary.com/dfegnpgwx/image/upload/v1774290421/%D8%AC%D8%A8%D8%B1_%D8%A7%D9%84%D8%B9%D9%82%D8%A7%D8%B1%D9%8A%D8%A9_logo_mn4ma1.png",
    bunny: "https://modonty-clients.b-cdn.net/bunny-test/sample-3.png",
  },
];

// The single large above-fold LCP image used by the isolated measurement pages.
export const LCP_PAIR = PAIRS[1]; // avatar (largest sample)

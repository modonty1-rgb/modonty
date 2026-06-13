/**
 * Brand identity — client/partner logos & marks use a SQUIRCLE (rounded square),
 * matching the modonty "m" mark, so they read as a "brand/entity". People (users,
 * authors, team members, commenters) stay CIRCLE per convention.
 *
 * Single knob: change the radius here and every brand avatar follows. It's a real
 * Tailwind arbitrary value (not a custom class) so tailwind-merge correctly overrides
 * a base `rounded-full` (e.g. on shadcn <Avatar>).
 */
export const BRAND_AVATAR_RADIUS = "rounded-[28%]";

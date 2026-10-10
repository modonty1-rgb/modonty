# Modonty Icon Standard v2

The rules every Modonty brand icon follows, on web (desktop + mobile) and in the React Native app.
Status: verified 2026-10-09 against primary sources — Material 3 [M3], Apple HIG [Apple], Fluent 2 + fluentui-system-icons [Fluent], IBM Design [IBM], Lucide [Lucide], W3C WCAG 2.2 [WCAG], Android adaptive icons [Android], react-native-svg [RNS]. Full source list at the end.

## 0. Identity (unchanged)
- A calm line body + **one** teal diamond, the signature. The body explains; the diamond is what the eye catches.
- The diamond comes from the logo: a square rotated **45°**.
- The **body alone must carry the meaning**. The diamond is decorative (teal `#00D8D8` on white is ~1.6:1, below WCAG 1.4.11's 3:1, so it can never be the only cue).

## 1. Two masters, not one
Modonty renders icons at 16 px far more than any other size (212 uses at 16, 81 at 20, 13 at 24 in `modonty/`). A 24-grid icon scaled to 16 loses a third of its stroke and blurs. Like Microsoft Fluent (separate 16/20/24 drawings) we keep two masters:

| Master | Canvas | Padding | Live area | Stroke | Used at |
|---|---|---|---|---|---|
| **M24** | 24 × 24 | 2 | 20 × 20 | **1.75** | 20, 24, 28, 32, 40 px |
| **M16** | 16 × 16 | 1 | 14 × 14 | **1.25** | 14 (to be removed), 16, 18 px |

M16 is not a scaled copy: fewer details, wider gaps, and coordinates snapped so vertical and horizontal strokes land on whole pixels.

Why these numbers: Material, IBM and Lucide use 2 px at 24; Fluent's assets use 1.5 px at 24 and 1 px at 16/20, with 1 px padding at 16 and 2 px at 20–32 [M3][IBM][Lucide][Fluent]. Modonty's "calm body" sits between them, so the style tile tests M24 at **1.5 / 1.75 / 2** and M16 at **1.25 / 1.5**, and the winner becomes final. Fluent draws each size separately and Apple asks for fewer, thicker, pixel-aligned lines at small sizes [Fluent][Apple]; Material places icons "on pixel" and asks for a text label below 20 dp on complex or key icons [M3].

## 2. Grid and keylines (M24; M16 scales by 2/3 then snaps)
- Keyline shapes so every icon reads the same size: **circle Ø20 · square 18×18 · portrait 16×20 · landscape 20×16** [M3].
- Content may enter the padding only when it needs extra visual weight, never past the canvas [M3]. The diamond may sit up to 1 px into it on a corner.
- Snap straight segments to whole or half pixels; arrow tips and at least one angled cap point on the grid [IBM].
- Match visual weight against the plain circle and square icons (blur test). Symmetric icons stay geometrically centred; asymmetric ones (download, play) get a small optical shift baked into the drawing [Lucide][Apple].
- Faces forward: no tilt, no perspective [M3][IBM].

## 3. Stroke, caps, corners
- One stroke weight per master. No thinner secondary strokes; if a detail needs to be lighter, remove it. "Use the same stroke weight for all icons" [Apple]; "no mixing" [Lucide].
- Caps **round**, joins **round**, always (Lucide's rule; Material and IBM use square terminals, which does not fit Modonty's soft line body) [Lucide][M3][IBM].
- Corner radius: **2** on 90° corners of elements 8 px or larger, **1** on smaller ones, sharp where three or more lines meet [Lucide]. M16 uses 1.5 / 1.
- Minimum gap: **2 px** between elements and inside shapes (a 2 px circle must fit) [Lucide]. M16: 1.5 px.
- Angles: 0°, 45°, 90° first (45° anti-aliases evenly), otherwise 15° steps [IBM].

## 4. The diamond
- Exactly **one** per icon.
- M24: square **3.5**, rotated 45°, corner radius 0.5. M16: square **2.5** (same share of the icon as the M24 diamond: 22 % vs 21 %; chosen in the phase-1 style tile).
- Fill `var(--modonty-<id>-accent, var(--modonty-accent, #00D8D8))`, no stroke.
- Placed on the **point of meaning** (bookmark notch, clock pivot, lens centre, bell clapper), at least **1 px** clear of the body, or deliberately interlocked as a knot. Never floating at random.

## 5. Optical weight
- Ink coverage of the M24 Regular at 24 px: **14–21.5 %**; containers and round marks (calendar, document, card, clock, compass, ball) up to **24 %**; M16 may run **+2.5**. A single straight stroke (remove) is exempt from the floor. Measurement tolerance ±0.3 % (anti-aliasing).
- Test every icon in a row of 8 neighbours at 16 / 20 / 24 / 32 px, light and dark.

## 6. Styles and states
- **Regular** (outline): default everywhere.
- **Filled**: only for the selected state of the bottom nav and tabs. Material animates Fill 0→1 for selected bottom navigation; Apple uses fill for iOS tab bars and selection; Fluent: "Filled is for highlighting selected states" [M3][Apple][Fluent]. Body filled with `currentColor`; the diamond stays teal on a 1 px knockout in the surface colour.
- No duotone, gradients, gold or shadows inside an icon. `Featured` and `Trust` become regular marks; any badge treatment is a component.

## 7. Colour and contrast
- Body: `currentColor`. On quiet surfaces `muted-foreground` (#5B5B5B: 6.7:1 on white, passes 3:1), elsewhere the text colour.
- Diamond: always accent teal in light and dark. On an accent-coloured surface the caller passes `[--modonty-<id>-accent:white]`.
- Body vs background: at least **3:1** (WCAG 2.2 SC 1.4.11, required for graphics needed to understand content and for state indicators) [WCAG]. Carbon asks 4.5:1 like text [IBM]; #5B5B5B meets both.
- Touch targets: icon buttons **48 × 48** in the mobile app and mobile web (Android 48 dp; Apple 44 pt; WCAG SC 2.5.5 AAA 44), **≥ 32** on desktop (WCAG SC 2.5.8 AA minimum 24; Material gives a 20 dp icon a 40 dp target on mouse layouts) [Apple][WCAG][M3].
- Icon-only buttons carry an Arabic accessible label [Apple].
- Next to text, centre the icon on the line, not on the baseline [IBM].

## 8. Sizes in the product (replaces the 22 Aug table)
| Role | Mobile | Desktop | Master |
|---|---|---|---|
| Bottom nav, section tabs | 24 | — | M24 |
| Top nav | 20 | 20 | M24 |
| Primary CTA | 20 | 16 | M24 / M16 |
| Card controls (save, audio, share) | 20 (target 48) | 16 (target 32) | M24 / M16 |
| Inline with text, meta rows | 16 | 16 | M16 |
| Section heading | 24 | 24 | M24 |
| Empty state | 40 | 40 | M24 |
- One row = one size. Nothing below 16 px (the 48 current uses of 14 px move to 16).

## 9. RTL
**Mirror** (direction, motion or reading order is the meaning) [M3][Apple]: arrows and chevrons, back/forward ("the most important icons for mirroring"), reply, send, login/logout, list / TOC / keypoints (text representations), the comment bubble with lines, speaker with sound waves (audio), trending line, directions, footprints (a person walking), undo/redo, progress and timeline marks.
**Never mirror** [M3][Apple]: search (right-hand-held magnifier), clock, refresh/loading arrows that turn clockwise, history, calendar, numbers and charts (analytics, pricing), media playback (play, pause, skip, progress), check, close, add/remove, slashes (link-off), real objects (phone, headset/support, keyboard, coffee cup), logos and brand marks.
Icons containing digits or letters are localised (Arabic numerals), never mirrored [M3][Apple]. Each icon records its decision as `mirror` or `fixed` (Fluent's `directionType`) [Fluent].

## 10. Production SVG (web + React Native)
- `<svg viewBox="0 0 24 24" fill="none" width="1em" height="1em" aria-hidden="true">` (M16: `0 0 16 16`).
- Only `path`, `circle`, `rect` (with `rx`), `line`, `polyline`, `polygon`, `ellipse`, using size and position attributes only [Lucide]. That is also the set `modonty-mobile/scripts/generate-icons.mjs` converts to react-native-svg.
- No `transform`, `filter`, `<use>`, `id`, `mask`, `clipPath`, gradient, `<style>` or text [Lucide][RNS]. Bake the diamond's 45° into its coordinates.
- Put `stroke`, `stroke-width`, `stroke-linecap="round"` and `stroke-linejoin="round"` **on every body element**, not only the root: react-native-svg defaults to square caps and miter joins [RNS], and the mobile generator copies element attributes.
- Body: `stroke="var(--modonty-<id>-body, currentColor)"`; react-native-svg feeds `currentColor` from the `color` prop [RNS].
- Coordinates to 2 decimals (Lucide tidies to 3) [Lucide].
- File name and component name unchanged (`modonty-bookmark-mark.tsx` → `ModontyBookmarkMark`) so `shared/lib/icons.ts` and the app generator keep working.

## 11. App launcher icon (separate from the UI set)
- **iOS:** 1024 × 1024 square layers (background + foreground) built in Icon Composer; the system applies the rounded mask, so never pre-mask. Provide default, dark and tinted appearances (the system generates missing ones; keep the same features in all). SVG/PDF layers, no thin lines, no text [Apple].
- **Android adaptive:** foreground and background layers of 108 × 108 dp; the inner 72 dp shows; the **66 dp safe zone** is never clipped; logo 48–66 dp; no masks or shadows in the layers. Add a `<monochrome>` layer for themed icons (Android 13+) [Android].
- **Google Play:** 512 × 512 PNG, sRGB, full square, no rounding or shadow (Play adds them), ≤ 1 MB [Android].
- The launcher uses the logo (blue tile + "m" + diamond), never a UI icon.

## 11b. One set on iOS, Android and the web (verified 2026-10-09)
- **One SVG, three platforms, no per-platform drawings.** React Native sizes are density-independent units (pt on iOS, dp on Android) [RN]; a CSS px is the reference pixel [CSS]. So `viewBox 0 0 24 24` at size 24 = 24 pt = 24 dp = 24 CSS px. Apple: use a vector (PDF/SVG), "you don't need to provide high-resolution versions" [Apple]. No @2x/@3x exports.
- **Bottom nav / tab bar icon: 24** on both apps. Android M3 navigation bar icon is 24 dp [M3 tokens]. Apple delegates tab-bar icon dimensions to Apple Design Resources (exact pt not stated in the HIG; marked unverified), so 24 is used on iOS too.
- **Selected = Filled, on both platforms.** iOS tab bars "prefer filled symbols or icons" while toolbars take the outline variant [Apple]. Android's official Compose sample uses Filled for the selected destination and Outlined for the rest [M3 sample]. Our tab bar is a custom React Native component, so it swaps Regular → Filled itself (the native system does not).
- The Android "active indicator" pill (56 × 32 dp) is a component behind the icon, never part of the SVG [M3 tokens]. iOS uses no pill [Apple].
- **Touch target: 48 × 48** everywhere in the app (Android minimum 48 dp; iOS 44 pt; web 24 CSS px; 48 satisfies all three) [Android][Apple][WCAG]. Matches `documents/mobile/UIUX-RULES.md`.
- **Text-size scaling:** Apple asks to grow meaningful icons as the font size grows, up to 200 % [Apple]. React Native does not scale SVGs automatically; the app scales icons by `PixelRatio.getFontScale()` (capped), the web sizes them in `em`. So every icon must still look right at 2× (48 px), which M24 covers.
- Directional icons carry a `mirror` flag; the app flips them under RTL like the web does.

## 11c. How the code picks a master (web)
- Every mark accepts `size`: below 20 → M16, otherwise M24, and the box becomes `size` × `size`.
- Without `size`, a Tailwind size class without a breakpoint (`size-3` … `size-4.5`, `h-…`, `w-…`) selects M16; everything else gets M24 in a `1em` box. Helper: `shared/components/icons/mark-size.ts`.
- Filled marks draw their knockout ring and inner lines in `--modonty-knockout`, which defaults to `hsl(var(--background))`; set it on a card or a coloured surface.

## 12. Acceptance checks (all measurable, run on every icon)
1. viewBox and canvas match its master.
2. Exactly one stroke width, round caps and joins.
3. Exactly one diamond of the right size at 45°.
4. Bounding box inside the live area.
5. Ink coverage in band.
6. Renders clean at 16 / 20 / 24 / 32, light and dark.
7. RTL mirror decision recorded.
8. Converts through the mobile generator with no unsupported element.

## Sources (fetched 2026-10-09)
- [M3] https://m3.material.io/styles/icons/designing-icons · https://m3.material.io/styles/icons/applying-icons · https://m1.material.io/usability/bidirectionality.html
- [Apple] https://developer.apple.com/design/human-interface-guidelines/icons · /sf-symbols · /right-to-left · /app-icons · /accessibility · /buttons
- [Fluent] https://fluent2.microsoft.design/iconography · https://github.com/microsoft/fluentui-system-icons (stroke and padding derived from the assets, not stated in prose)
- [IBM] https://www.ibm.com/design/language/iconography/ui-icons/design · https://carbondesignsystem.com/elements/icons/usage/
- [Lucide] https://lucide.dev/contribute/icon-design-guide · /icons/specification · /icons/code-conventions
- [WCAG] https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html · /target-size-minimum.html · /target-size-enhanced.html
- [Android] https://developer.android.com/develop/ui/views/launch/icon_design_adaptive · https://developer.android.com/distribute/google-play/resources/icon-design-specifications
- [RNS] https://github.com/software-mansion/react-native-svg/blob/main/USAGE.md
- [RN] https://reactnative.dev/docs/height-and-width · https://reactnative.dev/docs/pixelratio
- [CSS] https://www.w3.org/TR/css-values-4/#reference-pixel
- [M3 tokens] https://github.com/androidx/androidx — compose/material3 `NavigationBarTokens.kt`, `NavigationBarVerticalItemTokens.kt`, `IconButton.kt` · [M3 sample] `NavigationBarSamples.kt`
- [Apple] also: https://developer.apple.com/design/human-interface-guidelines/tab-bars · /toolbars · /typography
- [Android] also: https://developer.android.com/guide/topics/ui/accessibility/apps · https://developer.android.com/training/multiscreen/screendensities

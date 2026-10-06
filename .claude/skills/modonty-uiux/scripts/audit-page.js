// modonty-uiux — measure pages as numbers, not impressions.
//
// HOW TO RUN (Playwright MCP; `require` is not available inside browser_run_code):
//   1) browser_run_code_unsafe  code: async (page) => { page.context().__audit = { urls: ["http://localhost:3000/clients/<slug>", ...], widths: [1280, 390, 360] }; return "ok"; }
//      (each run gets a fresh globalThis — the browser context is what survives between calls)
//   2) browser_run_code_unsafe  filename: c:/Users/w2nad/Desktop/dreamToApp/MODONTY/.claude/skills/modonty-uiux/scripts/audit-page.js
// It reuses an open localhost tab (never opens a new one) and returns ONLY findings per page/width:
// overflow · text < 14px (phone) / 12px (desktop) · targets < 44px (phone) · h1 count · heading
// skips · images without alt · image files > 2.5× rendered width · orphan heading words · empty
// sections · page height.
async (page) => {
  const cfg = page.context().__audit || {};
  const urls = cfg.urls || [];
  const widths = cfg.widths || [1280, 390, 360];
  const p = page.context().pages().find((x) => x.url().startsWith("http://localhost")) || page;

  const measure = () => {
    const vw = innerWidth;
    const phone = vw < 768;
    const visible = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 1 && r.height > 1 && s.visibility !== "hidden" && s.display !== "none"; };
    const label = (e) => (e.textContent || e.getAttribute("aria-label") || e.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
    const overflow = document.documentElement.scrollWidth - vw;
    const offenders = overflow > 0 ? [...document.querySelectorAll("body *")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1) && getComputedStyle(e).position !== "fixed"; }).slice(0, 4).map((e) => `${e.tagName}.${String(e.className).slice(0, 40)}`) : [];
    const minText = phone ? 14 : 12;
    const smallText = [...document.querySelectorAll("main *, header *, footer *")].filter((e) => e.childElementCount === 0 && e.textContent.trim().length > 1 && visible(e) && parseFloat(getComputedStyle(e).fontSize) < minText && !e.closest('[aria-hidden="true"]')).slice(0, 8).map((e) => `${parseFloat(getComputedStyle(e).fontSize)}px «${label(e)}»`);
    const smallTargets = phone ? [...document.querySelectorAll("a[href], button, input, select, textarea, summary, [role=button]")].filter(visible).filter((e) => !(e.tagName === "A" && e.closest("p") && e.closest("p").textContent.trim().length > e.textContent.trim().length + 15)).filter((e) => { /* WCAG 2.5.8: inline links in a sentence are exempt · a checkbox/radio inside a <label> is targeted by the label */ const t = (e.matches("input[type=checkbox], input[type=radio]") && e.closest("label")) || e; const r = t.getBoundingClientRect(); const a = getComputedStyle(e, "::after"); const pad = a.content !== "none" ? Math.max(parseFloat(a.width) || 0, parseFloat(a.height) || 0) : 0; return Math.max(r.height, pad) < 44 || Math.max(r.width, pad) < 24; }).slice(0, 8).map((e) => { const r = e.getBoundingClientRect(); return `${Math.round(r.width)}×${Math.round(r.height)} «${label(e)}»`; }) : [];
    const headings = [...document.querySelectorAll("h1, h2, h3, h4")].filter(visible).map((h) => +h.tagName[1]);
    const headingSkips = headings.filter((lvl, i) => i > 0 && lvl > headings[i - 1] + 1).length;
    const h1 = document.querySelectorAll("h1").length;
    const noAlt = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length;
    const oversized = [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth && visible(i) && i.getBoundingClientRect().width > 40 && i.naturalWidth > 2.5 * i.getBoundingClientRect().width * devicePixelRatio).slice(0, 4).map((i) => `${i.naturalWidth}w→${Math.round(i.getBoundingClientRect().width)}px`);
    const orphans = [...document.querySelectorAll("h1, h2, h3")].filter(visible).filter((h) => {
      const range = document.createRange(); range.selectNodeContents(h);
      const rects = [...range.getClientRects()]; const firstBottom = Math.min(...rects.map((r) => r.bottom)); if (!rects.some((r) => r.top >= firstBottom - 2)) return false; /* all on one line (e.g. a flex title + score) — not an orphan */
      const lastTop = Math.round(rects[rects.length - 1].top);
      const lastW = rects.filter((r) => Math.round(r.top) === lastTop).reduce((w, r) => w + r.width, 0);
      const words = h.textContent.trim().split(/\s+/).length;
      return words > 2 && lastW < (h.getBoundingClientRect().width / words) * 1.2;
    }).map(label);
    const empty = [...document.querySelectorAll("section")].filter(visible).filter((s) => { const h = s.querySelector("h2"); return h && !s.querySelector("img, video, iframe, form") && s.innerText.trim().length < h.innerText.length + 20; }).map((s) => s.id || "section");
    return { overflow, offenders, smallText, smallTargets, h1, headingSkips, noAlt, oversized, orphans, empty, height: document.documentElement.scrollHeight };
  };

  const out = {};
  for (const url of urls) {
    const key = decodeURIComponent(url).replace(/^.*\/clients\/[^/]+/, "") || "/";
    out[key] = {};
    for (const w of widths) {
      try {
        await p.setViewportSize({ width: w, height: w < 768 ? 844 : 800 });
        await p.goto(url, { waitUntil: "load", timeout: 90000 });
        await p.waitForTimeout(700);
        const r = await p.evaluate(measure);
        const f = {};
        if (r.overflow > 0) f.overflow = `${r.overflow}px ${r.offenders.join(" ")}`;
        for (const k of ["smallText", "smallTargets", "oversized", "orphans", "empty"]) if (r[k].length) f[k] = r[k];
        if (r.h1 !== 1) f.h1 = r.h1;
        if (r.headingSkips) f.headingSkips = r.headingSkips;
        if (r.noAlt) f.noAlt = r.noAlt;
        f.height = r.height;
        out[key][w] = f;
      } catch (e) {
        out[key][w] = "ERR " + String(e).slice(0, 100);
      }
    }
  }
  await p.setViewportSize({ width: 1280, height: 800 });
  return JSON.stringify(out, null, 1);
}

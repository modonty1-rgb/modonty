// The phone audit shared by mobile-run.mjs (modonty) and console-mobile-run.mjs (console) — one
// definition of «what is wrong on a phone», so both apps are judged by the same rules:
// horizontal overflow against the device width (and the elements causing it), tap targets under
// 44 px (tiny = under 32×24, near = between that and 44), and text under 12 px.
// `allTaps`: check every control on the page, not only the first three screens (the console run
// wants the whole page; the modonty run keeps its original scope).
export async function audit(page, { allTaps = false } = {}) {
  return page.evaluate((allTaps) => {
    // A phone shrinks an overflowing page to fit, so innerWidth grows past the device width and
    // scrollWidth == innerWidth — measure against the device (screen.width), not the layout.
    const vw = window.screen.width;
    const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && Number(cs.opacity) > 0.05; };
    const inScroller = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a).overflowX; if (o === "auto" || o === "scroll" || o === "hidden" || o === "clip") return true; } return false; };
    const label = (el) => (el.getAttribute("aria-label") || el.innerText || el.getAttribute("placeholder") || el.tagName).replace(/\s+/g, " ").trim().slice(0, 40);
    const overflowPx = Math.max(document.documentElement.scrollWidth, window.innerWidth) - vw;
    const wide = [];
    if (overflowPx > 1) {
      for (const el of document.body.querySelectorAll("*")) {
        if (!visible(el) || inScroller(el)) continue;
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 || r.left < -1) wide.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0] || ""} [${Math.round(r.left)}→${Math.round(r.right)}] ${label(el)}`);
        if (wide.length >= 6) break;
      }
    }
    const taps = [...document.querySelectorAll("a[href], button, [role=button], input:not([type=hidden]), select, textarea")].filter(visible).filter((el) => { const r = el.getBoundingClientRect(); return allTaps || r.top < innerHeight * 3; })
      // A link inside a sentence is exempt from target size (WCAG 2.5.8 «inline» exception).
      .filter((el) => !(el.tagName === "A" && el.closest("p")))
      // Breadcrumbs are secondary navigation: WCAG 2.5.8 asks 24px there, not 44 (page-frame.tsx).
      .filter((el) => !(el.closest("nav[aria-label='مسار الصفحة']") && el.getBoundingClientRect().height >= 24))
      // The skip link is 1×1 until focused — by design.
      .filter((el) => !el.matches("a[href^='#main'], a[href='#main-content']"));
    // A control inside a <label> is tapped through the whole label — measure that instead.
    // And a link stretched over its card by an absolute ::after is tapped through the whole card.
    const hit = (el) => {
      const l = el.closest("label") ?? (el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null);
      if (l && l !== el) {
        // The control and its label are one target: tapping either toggles it. A control that
        // also carries its own enlarged ::before/::after hit area keeps the larger of the two.
        const a = el.getBoundingClientRect(), c = l.getBoundingClientRect();
        let w = Math.max(a.right, c.right) - Math.min(a.left, c.left), h = Math.max(a.bottom, c.bottom) - Math.min(a.top, c.top);
        if (getComputedStyle(el).position !== "static") for (const pseudo of ["::before", "::after"]) {
          const ps = getComputedStyle(el, pseudo);
          if (ps.position === "absolute" && ps.content !== "none") { w = Math.max(w, parseFloat(ps.width) || 0); h = Math.max(h, parseFloat(ps.height) || 0); }
        }
        return { width: w, height: h };
      }
      // An absolute ::before/::after on a positioned control is its hit area (after:size-11,
      // before:-inset-1.5 …) — take the larger of the two and the box itself.
      if (getComputedStyle(el).position !== "static") {
        const r = el.getBoundingClientRect();
        let w = r.width, h = r.height;
        for (const pseudo of ["::before", "::after"]) {
          const ps = getComputedStyle(el, pseudo);
          if (ps.position === "absolute" && ps.content !== "none") { w = Math.max(w, parseFloat(ps.width) || 0); h = Math.max(h, parseFloat(ps.height) || 0); }
        }
        if (w > r.width || h > r.height) return { width: w, height: h };
      }
      const after = getComputedStyle(el, "::after");
      if (after.position === "absolute") {
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).position !== "static") return a.getBoundingClientRect();
      }
      return el.getBoundingClientRect();
    };
    const small = taps.map((el) => ({ el, r: hit(el) })).filter(({ r }) => r.height < 44 || r.width < 44);
    // With allTaps (the console run) each finding also names the element's classes — enough to find it in the code.
    const where = (el) => (allTaps ? ` {${el.tagName.toLowerCase()} ${String(el.className).replace(/\s+/g, " ").slice(0, 90)}}` : "");
    const tiny = small.filter(({ r }) => r.height < 32 || r.width < 24).map(({ el, r }) => `${Math.round(r.width)}×${Math.round(r.height)} ${label(el)}${where(el)}`);
    const near = small.filter(({ r }) => !(r.height < 32 || r.width < 24)).map(({ el, r }) => `${Math.round(r.width)}×${Math.round(r.height)} ${label(el)}${where(el)}`);
    const smallText = [];
    for (const el of document.body.querySelectorAll("p, span, a, button, li, small, label, div")) {
      if (!visible(el) || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs < 12) smallText.push(`${fs}px ${el.innerText.replace(/\s+/g, " ").trim().slice(0, 30)}${allTaps ? ` {${el.tagName.toLowerCase()} ${String(el.className).slice(0, 70)}}` : ""}`);
      if (smallText.length >= 6) break;
    }
    return { vw, overflowPx: Math.max(0, overflowPx), wide, tapsChecked: taps.length, under44: small.length, tiny: tiny.slice(0, 8), near: near.slice(0, 12), smallText };
  }, allTaps);
}

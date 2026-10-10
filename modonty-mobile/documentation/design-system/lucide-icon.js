// <l-icon name="house" size="24" sw="1.75" fill="none"> — Lucide stand-in until the Modonty icon set ships.
(function () {
  if (customElements.get('l-icon')) return;
  const SRC = 'https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js';
  const pending = new Set();
  function ready() { return window.lucide && window.lucide.icons; }
  if (!ready() && !document.querySelector('script[data-lucide-umd]')) {
    const s = document.createElement('script');
    s.src = SRC; s.dataset.lucideUmd = '1';
    s.onload = () => { pending.forEach(el => el.render()); pending.clear(); };
    document.head.appendChild(s);
  }
  const pascal = n => n.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
  const NS = 'http://www.w3.org/2000/svg';
  function build(node, size, sw, fill) {
    let children = node;
    if (Array.isArray(node) && node[0] === 'svg') children = node[2] || [];
    const svg = document.createElementNS(NS, 'svg');
    const a = { width: size, height: size, viewBox: '0 0 24 24', fill: fill || 'none', stroke: 'currentColor', 'stroke-width': sw, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' };
    for (const k in a) svg.setAttribute(k, a[k]);
    svg.style.display = 'block';
    (children || []).forEach(([tag, attrs]) => {
      const el = document.createElementNS(NS, tag);
      for (const k in attrs) if (k !== 'key') el.setAttribute(k, attrs[k]);
      svg.appendChild(el);
    });
    return svg;
  }
  class LIcon extends HTMLElement {
    static get observedAttributes() { return ['name', 'size', 'sw', 'fill']; }
    connectedCallback() { this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }
    render() {
      const size = this.getAttribute('size') || '24';
      this.style.display = 'inline-flex';
      this.style.flex = 'none';
      this.style.width = size + 'px';
      this.style.height = size + 'px';
      if (!ready()) { pending.add(this); return; }
      const node = window.lucide.icons[pascal(this.getAttribute('name') || 'circle')] || window.lucide.icons.Circle;
      const root = this.shadowRoot || this.attachShadow({ mode: 'open' });
      root.replaceChildren(build(node, size, this.getAttribute('sw') || '1.75', this.getAttribute('fill')));
    }
  }
  customElements.define('l-icon', LIcon);
})();

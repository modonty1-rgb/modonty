// يولّد assets/fonts/ModontyIcons.ttf وsrc/components/brand/icon-glyphs.ts من icon-geometry.ts.
// يُشغَّل بعد أي تعديل على الأيقونات (بعد scripts/generate-icons.mjs):
//   cd $(mktemp -d) && npm i canvaskit-wasm svgicons2svgfont svg2ttf && NODE_PATH=$PWD/node_modules node <المشروع>/scripts/build-icon-font.cjs
// الأدوات خارج package.json عمداً (لا تمسّ lockfile المستودع — قفل pnpm).
// يحوّل هندسة أيقونات مدونتي (icon-geometry.ts) إلى خطّ أيقونات: كل أيقونة طبقتان مملوءتان (الجسم · الأكسنت)،
// الخطوط (stroke) تُحوَّل لأشكال بـSkia نفسه (CanvasKit)، و«الثقب» (white) يُطرح فعلاً. ترتيب الرسم كما في SVG.
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const CanvasKitInit = require('canvaskit-wasm');
const { SVGIcons2SVGFontStream } = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');

const APP = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(APP, 'src/components/brand/icon-geometry.ts'), 'utf8');
const body = src.slice(src.indexOf('{', src.indexOf('ICON_GEOMETRY')), src.lastIndexOf('}') + 1).replace(/\}\s*as const;?\s*$/, '}');
const GEOMETRY = eval('(' + body + ')');
const EM = 1000;
const K = EM / 24;

(async () => {
  const CK = await CanvasKitInit();
  const CAP = { round: CK.StrokeCap.Round, butt: CK.StrokeCap.Butt, square: CK.StrokeCap.Square };
  const JOIN = { round: CK.StrokeJoin.Round, miter: CK.StrokeJoin.Miter, bevel: CK.StrokeJoin.Bevel };
  const mul = (a, b) => CK.Matrix.multiply(a, b);

  function parseTransform(t) {
    let m = CK.Matrix.identity();
    if (!t) return m;
    for (const [, fn, args] of t.matchAll(/(\w+)\(([^)]*)\)/g)) {
      const n = args.split(/[ ,]+/).filter(Boolean).map(Number);
      if (fn === 'scale') m = mul(m, CK.Matrix.scaled(n[0], n.length > 1 ? n[1] : n[0]));
      else if (fn === 'translate') m = mul(m, CK.Matrix.translated(n[0], n[1] || 0));
      else if (fn === 'rotate') m = mul(m, CK.Matrix.rotated((n[0] * Math.PI) / 180, n[1] || 0, n[2] || 0));
      else throw new Error('transform ' + fn);
    }
    return m;
  }

  function shapeOf(n) {
    if (n.t === 'Path') {
      const p = CK.Path.MakeFromSVGString(n.d);
      if (!p) throw new Error('bad d ' + n.d);
      return p;
    }
    const b = new CK.PathBuilder();
    if (n.t === 'Rect') {
      const r = CK.LTRBRect(n.x || 0, n.y || 0, (n.x || 0) + n.width, (n.y || 0) + n.height);
      if (n.rx) b.addRRect(CK.RRectXY(r, n.rx, n.ry ?? n.rx));
      else b.addRect(r);
    } else if (n.t === 'Circle') b.addCircle(n.cx, n.cy, n.r);
    else throw new Error('tag ' + n.t);
    return b.detach();
  }

  const xf = (p, m) => new CK.PathBuilder(p).transform(m).detach();
  const comb = (a, b, op) => {
    const r = CK.Path.MakeFromOp(a, b, op);
    if (!r) throw new Error('op failed');
    return r;
  };

  // اتجاه الحلقات: الخطّ يملأ بـnonzero، فكل حلقة عكس اتجاه الحلقة المحيطة بها (العمق زوجي ↔ فردي).
  // makeAsWinding في Skia أخطأ في «search» فملأ الثقب — فيُحسب هنا يدوياً على أوامر M/L/Q/C/Z المطلقة.
  function orient(d) {
    const toks = d.match(/[MLQCZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
    const contours = [];
    let cur = null, i = 0;
    const num = () => Number(toks[i++]);
    while (i < toks.length) {
      const c = toks[i++];
      if (c === 'M') { cur = { start: [num(), num()], segs: [] }; contours.push(cur); }
      else if (c === 'L') cur.segs.push({ t: 'L', p: [[num(), num()]] });
      else if (c === 'Q') cur.segs.push({ t: 'Q', p: [[num(), num()], [num(), num()]] });
      else if (c === 'C') cur.segs.push({ t: 'C', p: [[num(), num()], [num(), num()], [num(), num()]] });
      else if (c === 'Z') {}
      else throw new Error('cmd ' + c);
    }
    const strOf = (k) => `M${k.start.join(' ')}` + k.segs.map((g) => g.t + g.p.map((q) => q.join(' ')).join(' ')).join('') + 'Z';
    const area = (k) => {
      const pts = [k.start, ...k.segs.flatMap((g) => g.p)];
      let a = 0;
      for (let j = 0; j < pts.length; j++) { const [x1, y1] = pts[j]; const [x2, y2] = pts[(j + 1) % pts.length]; a += x1 * y2 - x2 * y1; }
      return a;
    };
    const reverse = (k) => {
      const ends = [k.start, ...k.segs.map((g) => g.p[g.p.length - 1])];
      const segs = [];
      for (let j = k.segs.length - 1; j >= 0; j--) {
        const g = k.segs[j], from = ends[j];
        if (g.t === 'L') segs.push({ t: 'L', p: [from] });
        else if (g.t === 'Q') segs.push({ t: 'Q', p: [g.p[0], from] });
        else segs.push({ t: 'C', p: [g.p[1], g.p[0], from] });
      }
      return { start: ends[ends.length - 1], segs };
    };
    const paths = contours.map((k) => CK.Path.MakeFromSVGString(strOf(k)));
    const out = contours.map((k, j) => {
      const [x, y] = k.start;
      let depth = 0;
      paths.forEach((q, m) => { if (m !== j && q.contains(x, y)) depth++; });
      const want = depth % 2 === 0 ? 1 : -1;
      return Math.sign(area(k)) === want ? k : reverse(k);
    });
    return out.map(strOf).join('');
  }
  function render(nodes, root) {
    let P = new CK.PathBuilder().detach();
    let A = new CK.PathBuilder().detach();
    const U = CK.PathOp.Union;
    const D = CK.PathOp.Difference;
    const paint = (shape, kind) => {
      if (kind === 'primary') {
        P = comb(P, shape, U);
        A = comb(A, shape, D);
      } else if (kind === 'accent') {
        A = comb(A, shape, U);
        P = comb(P, shape, D);
      } else if (kind === 'white') {
        P = comb(P, shape, D);
        A = comb(A, shape, D);
      }
    };
    const walk = (list, m) => {
      for (const n of list) {
        if (n.t === 'G') {
          walk(n.children || [], mul(m, parseTransform(n.transform)));
          continue;
        }
        const local = shapeOf(n);
        const fill = n.fill ?? 'none';
        if (fill !== 'none') {
          paint(xf(local, m), fill);
        }
        if (n.stroke && n.stroke !== 'none') {
          const s = local.makeStroked({ width: n.strokeWidth ?? 1, cap: CAP[n.strokeLinecap || 'butt'], join: JOIN[n.strokeLinejoin || 'miter'], miter_limit: 4, precision: 4 });
          if (!s) throw new Error('stroke failed');
          paint(xf(s, m), n.stroke);
        }
      }
    };
    walk(nodes, root);
    const out = {};
    for (const [k, p0] of [['p', P], ['a', A]]) {
      const p = xf(p0, CK.Matrix.scaled(K, K));
      const raw = p.toSVGString();
      const d = raw && raw.length > 4 ? orient(raw) : raw;
      out[k] = d && d.length > 4 ? d : null;
    }
    return out;
  }

  const I = CK.Matrix.identity();
  const glyphs = {};
  for (const [name, nodes] of Object.entries(GEOMETRY)) glyphs[name] = render(nodes, I);
  // اتجاه السهم و«لا يعجبني» — نفس transformOf في ModontyIcon.
  glyphs.arrowMirror = render(GEOMETRY.arrow, mul(CK.Matrix.scaled(-1, 1), CK.Matrix.translated(-24, 0)));
  glyphs.dislike = render(GEOMETRY.like, CK.Matrix.rotated(Math.PI, 12, 12));

  const dir = path.join(require('os').tmpdir(), 'modonty-icon-glyphs');
  fs.mkdirSync(dir, { recursive: true });
  const map = {};
  let code = 0xe001;
  const files = [];
  for (const [name, g] of Object.entries(glyphs)) {
    const entry = [0, 0];
    for (const [i, k] of [[0, 'p'], [1, 'a']]) {
      if (!g[k]) continue;
      const f = path.join(dir, `${name}-${k}.svg`);
      fs.writeFileSync(f, `<svg xmlns="http://www.w3.org/2000/svg" width="${EM}" height="${EM}" viewBox="0 0 ${EM} ${EM}"><path d="${g[k]}"/></svg>`);
      files.push({ f, name: `${name}-${k}`, code });
      entry[i] = code++;
    }
    map[name] = entry;
  }

  const fontStream = new SVGIcons2SVGFontStream({ fontName: 'ModontyIcons', fontHeight: EM, descent: 0, normalize: false, log: () => {} });
  const chunks = [];
  fontStream.on('data', (c) => chunks.push(c));
  const done = new Promise((res, rej) => { fontStream.on('end', res); fontStream.on('error', rej); });
  for (const g of files) {
    const s = fs.createReadStream(g.f);
    s.metadata = { unicode: [String.fromCodePoint(g.code)], name: g.name };
    fontStream.write(s);
  }
  fontStream.end();
  await done;
  const ttf = svg2ttf(chunks.map(String).join(""), {});
  fs.mkdirSync(path.join(APP, 'assets/fonts'), { recursive: true });
  fs.writeFileSync(path.join(APP, 'assets/fonts/ModontyIcons.ttf'), Buffer.from(ttf.buffer));
  const ts =
    '// ملفّ مولَّد — لا يُعدَّل يدوياً. المولِّد: scripts/build-icon-font.cjs من icon-geometry.ts.\n' +
    '/** لكل أيقونة رمزا الطبقتين في ModontyIcons.ttf: [الجسم، الأكسنت] — ٠ = لا طبقة. */\n' +
    'export const ICON_GLYPHS: Record<string, readonly [number, number]> = ' + JSON.stringify(map) + ';\n';
  fs.writeFileSync(path.join(APP, 'src/components/brand/icon-glyphs.ts'), ts);
  console.log('icons', Object.keys(map).length, 'glyphs', files.length, 'ttf bytes', ttf.buffer.byteLength);
  const empty = Object.entries(glyphs).filter(([, g]) => !g.p && !g.a).map(([n]) => n);
  console.log('empty', empty.join(',') || 'none');
})().catch((e) => { console.error(e); process.exit(1); });

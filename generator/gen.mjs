// Gera os SVGs animados do README do Daniel em ../assets — tema "energético azul e prata em 8-bit"
// uso: node generator/gen.mjs   ·   prévia: node generator/serve.mjs → http://localhost:8766/generator/preview.html
// Tudo é pixel art desenhada aqui (fonte 5x7 própria, lata, asas, touros, sol); só os prints dos projetos vêm de src/.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "src");
const OUT = join(HERE, "..", "assets");
mkdirSync(OUT, { recursive: true });

const MONO = "ui-monospace, 'Cascadia Code', 'SF Mono', Consolas, Menlo, 'DejaVu Sans Mono', monospace";

// paleta
const C = {
  night: "#070d2b", navy: "#0b1340", navy2: "#13205e", blue: "#1e3a8a", blue2: "#2b4fb3", sky: "#5b8def",
  silver: "#c9ced8", silver2: "#8a93a6", white: "#f4f6fb", yel: "#ffc906", yel2: "#f59e0b", red: "#e2001a", red2: "#9b0012", green: "#3ddc84",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const b64 = (f, mime) => `data:${mime};base64,${readFileSync(join(SRC, f)).toString("base64")}`;
const jpg = (f) => b64(f, "image/jpeg");
const png = (f) => b64(f, "image/png");
const icon64 = (name) => b64(join("icons", `${name}.svg`), "image/svg+xml");
const n = (v) => Math.round(v * 100) / 100;
const kt = (times, T) => times.map((t) => (Math.min(Math.max(t / T, 0), 1)).toFixed(5)).join(";");

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const svg = (w, h, body, style = "", title = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" shape-rendering="crispEdges">` +
  (title ? `<title>${esc(title)}</title>` : "") +
  (style ? `<style>${style.replace(/\s*\n\s*/g, "")}</style>` : "") + body + `</svg>`;

function write(name, content) {
  writeFileSync(join(OUT, name), content);
  console.log(`${name.padEnd(26)} ${(Buffer.byteLength(content) / 1024).toFixed(1)} KB`);
}

const BASE_STYLE = `@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
  @keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
  @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  .blink{animation:blink 1s steps(1) infinite}
  .fa{animation:blink .5s steps(1) infinite}.fb{animation:blink .5s steps(1) -.25s infinite}`;

/* ───────────── PIXEL: células → path ───────────── */
function cellsPath(cells, px, ox = 0, oy = 0) {
  const rows = new Map();
  for (const [x, y] of cells) { if (!rows.has(y)) rows.set(y, new Set()); rows.get(y).add(x); }
  let d = "";
  for (const [y, set] of rows) {
    const xs = [...set].sort((a, b) => a - b);
    for (let i = 0; i < xs.length;) {
      let j = i; while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
      const len = j - i + 1;
      d += `M${n(ox + xs[i] * px)} ${n(oy + y * px)}h${n(len * px)}v${n(px)}h${n(-len * px)}z`;
      i = j + 1;
    }
  }
  return d;
}

// sprite a partir de linhas de texto; cada caractere = cor da paleta, "." = vazio
function sprite(rows, pal, px, ox = 0, oy = 0, { flip = false } = {}) {
  const by = {};
  const w = Math.max(...rows.map((r) => r.length));
  rows.forEach((r, y) => [...r].forEach((ch, x) => {
    if (ch === "." || ch === " " || !pal[ch]) return;
    (by[ch] ||= []).push([flip ? w - 1 - x : x, y]);
  }));
  return Object.entries(by).map(([ch, cells]) => `<path d="${cellsPath(cells, px, ox, oy)}" fill="${pal[ch]}"/>`).join("");
}

/* ───────────── FONTE 5x7 ───────────── */
const F = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"], B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."], D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"], F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"], H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"], J: ["..###", "...#.", "...#.", "...#.", "#..#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"], L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"], N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."], P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"], R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."], T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."], V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "#.#.#", ".#.#."], X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."], Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  0: [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."], 1: ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  2: [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"], 3: ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
  4: ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."], 5: ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  6: ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."], 7: ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
  8: [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."], 9: [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."], "?": [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
  ".": [".....", ".....", ".....", ".....", ".....", ".....", "..#.."], ",": [".....", ".....", ".....", ".....", ".....", "..#..", ".#..."],
  ":": [".....", "..#..", ".....", ".....", ".....", "..#..", "....."], "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."], "&": [".##..", "#..#.", "#.#..", ".#...", "#.#.#", "#..#.", ".##.#"],
  "·": [".....", ".....", ".....", "..#..", ".....", ".....", "....."], "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
  "(": ["...#.", "..#..", ".#...", ".#...", ".#...", "..#..", "...#."], ")": [".#...", "..#..", "...#.", "...#.", "...#.", "..#..", ".#..."],
  "%": ["##..#", "##.#.", "...#.", "..#..", ".#...", ".#.##", "#..##"], "@": [".###.", "#...#", "#.###", "#.#.#", "#.###", "#....", ".###."],
  ">": [".#...", "..#..", "...#.", "....#", "...#.", "..#..", ".#..."], "'": ["..#..", "..#..", ".....", ".....", ".....", ".....", "....."],
  "_": [".....", ".....", ".....", ".....", ".....", ".....", "#####"], "★": ["..#..", "..#..", "#####", ".###.", ".#.#.", "#...#", "....."],
  "▶": ["#....", "##...", "###..", "####.", "###..", "##...", "#...."], "▼": [".....", "#####", ".###.", "..#..", ".....", ".....", "....."],
  "♥": [".....", ".#.#.", "#####", "#####", ".###.", "..#..", "....."],
};
const ACC = { acute: ["...#.", "..#.."], circ: ["..#..", ".#.#."], tilde: [".##.#", "#..#."] };
const DEC = { Á: ["A", "acute"], À: ["A", "acute"], Â: ["A", "circ"], Ã: ["A", "tilde"], É: ["E", "acute"], Ê: ["E", "circ"], Í: ["I", "acute"],
  Ó: ["O", "acute"], Ô: ["O", "circ"], Õ: ["O", "tilde"], Ú: ["U", "acute"], Ç: ["C", "ced"], "—": ["-"] };

const textW = (s, px) => ([...s].length * 6 - 1) * px;
function textCells(str) {
  const cells = []; let cx = 0;
  for (const ch0 of [...str.toUpperCase()]) {
    const [base, acc] = DEC[ch0] || [ch0];
    const g = F[base] || F["?"];
    g.forEach((row, r) => [...row].forEach((c, x) => c === "#" && cells.push([cx + x, r])));
    if (acc === "ced") cells.push([cx + 2, 7], [cx + 1, 8]);
    else if (acc) ACC[acc].forEach((row, r) => [...row].forEach((c, x) => c === "#" && cells.push([cx + x, r - 2])));
    cx += 6;
  }
  return cells;
}
// texto em pixel; y = topo das maiúsculas
function ptext(str, { x, y, px = 2, fill = C.white, shadow, anchor = "start", cls = "", style = "" }) {
  const w = textW(str, px);
  const ox = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
  const d = cellsPath(textCells(str), px, ox, y);
  const sh = shadow ? `<path d="${cellsPath(textCells(str), px, ox + px, y + px)}" fill="${shadow}"/>` : "";
  return `<g${cls ? ` class="${cls}"` : ""}${style ? ` style="${style}"` : ""}>${sh}<path d="${d}" fill="${fill}"/></g>`;
}

/* ───────────── SPRITES ───────────── */
// lata azul e prata (metade azul, metade prata, losangos), sol amarelo e dois touros vermelhos
function canCells() {
  const W = 22, H = 40, out = {};
  const put = (k, x, y) => (out[k] ||= []).push([x, y]);
  for (let x = 4; x <= 17; x++) put("s", x, 0);
  for (let x = 3; x <= 18; x++) put(x < 5 || x > 16 ? "d" : "w", x, 1);
  for (let x = 2; x <= 19; x++) put("d", x, 2);
  for (let x = 1; x <= 20; x++) put(x === 1 || x === 20 ? "k" : "s", x, 3);
  for (let y = 4; y <= 35; y++) {
    for (let x = 0; x <= 21; x++) {
      if (x === 0 || x === 21) { put("k", x, y); continue; }
      const lattice = (x + y) % 4 === 0 || (x - y + 400) % 4 === 0;
      let k = x <= 10 ? (lattice ? "s" : "b") : (lattice ? "b" : "s");
      if (x === 1 || x === 20) k = x <= 10 ? "B" : "d";
      if (x === 4 || x === 5) k = k === "b" ? "l" : "w";
      put(k, x, y);
    }
  }
  for (let x = 1; x <= 20; x++) put(x === 1 || x === 20 ? "k" : "d", x, 36);
  for (let x = 2; x <= 19; x++) put("s", x, 37);
  for (let x = 4; x <= 17; x++) put("d", x, 38);
  return out;
}
function canSVG(px, ox, oy, { label = true } = {}) {
  const pal = { s: C.silver, d: C.silver2, w: C.white, k: C.night, b: C.blue, B: C.navy2, l: C.blue2 };
  const cells = canCells();
  let s = Object.entries(cells).map(([k, cs]) => `<path d="${cellsPath(cs, px, ox, oy)}" fill="${pal[k]}"/>`).join("");
  // sol
  const sun = [];
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) if (x * x + y * y <= 38) sun.push([11 + x - 0.5, 15 + y]);
  s += `<path d="${cellsPath(sun.map(([x, y]) => [x, y]), px, ox, oy)}" fill="${C.yel}"/>`;
  // touros
  const bull = ["......R..", "..RRRRRR.", ".RRRRRRRR", "RRRRRRR..", ".R.R.R...", ".R...R..."];
  s += sprite(bull, { R: C.red }, px, ox + 2 * px, oy + 17 * px);
  s += sprite(bull, { R: C.red }, px, ox + 11 * px, oy + 17 * px, { flip: true });
  if (label) {
    s += `<rect x="${ox + px}" y="${oy + 25 * px}" width="${20 * px}" height="${7 * px}" fill="${C.silver}"/>`;
    s += ptext("RED BULL", { x: ox + 11 * px, y: oy + 25.9 * px, px: px * 0.4, fill: C.red, anchor: "middle", shadow: C.red2 });
    s += ptext("ENERGY DEV", { x: ox + 11 * px, y: oy + 29.6 * px, px: px * 0.25, fill: C.navy, anchor: "middle" });
  }
  return s;
}
const WING_UP = [
  ".........#####", ".......##WWWW#", "......#WWWWW#.", "....##WWWWW#..", "...#WWWWWW#...",
  "..#WWWWsWW#...", ".#WWWsWWW#....", "#WWsWWW##.....", "#WWWW##.......", "#####.........",
];
const WING_DN = [
  "..............", "..............", "#####.........", "#WWWW##.......", "#WWsWWW##.....",
  ".#WWWsWWW##...", "..#WWWWsWWW##.", "...#WWWWWWWWW#", "....##WWWWWW#.", "......######..",
];
const WPAL = { "#": C.silver2, W: C.white, s: C.silver };
function wings(px, cx, cy, gap) {
  // cx,cy = ponto de encaixe; gap = meia largura da lata
  const w = 14 * px;
  const side = (rows, flip) => sprite(rows, WPAL, px, flip ? cx - gap - w : cx + gap, cy - 10 * px, { flip });
  return `<g class="fa">${side(WING_UP, false)}${side(WING_UP, true)}</g><g class="fb">${side(WING_DN, false)}${side(WING_DN, true)}</g>`;
}
const BULL_A = ["..............#.", "...........RR#..", "..RRRRRRRRRRRR..", ".RRRRRRRRRRRRRR.", "RRRRRRRRRRRRRR..", "R.RRRRRRRRRR....", "..R.R....R.R....", ".R...R..R...R..."];
const BULL_B = ["..............#.", "...........RR#..", "..RRRRRRRRRRRR..", ".RRRRRRRRRRRRRR.", "RRRRRRRRRRRRRR..", "R.RRRRRRRRRR....", "...RR.....RR....", "...RR.....RR...."];
const CLOUD = ["....####......", "..########....", ".###########..", "##############"];

function stars(rand, count, w, h, px = 3) {
  let s = "";
  for (let i = 0; i < count; i++) {
    const x = Math.round((rand() * w) / px) * px, y = Math.round((rand() * h) / px) * px, d = n(1.5 + rand() * 3);
    const big = rand() > 0.85;
    s += big
      ? `<path d="M${x} ${y - px}h${px}v${px * 3}h${-px}zM${x - px} ${y}h${px * 3}v${px}h${-px * 3}z" fill="${C.white}" style="animation:tw ${d}s steps(3) ${n(-rand() * d)}s infinite"/>`
      : `<rect x="${x}" y="${y}" width="${px}" height="${px}" fill="${rand() > 0.5 ? C.white : C.yel}" style="animation:tw ${d}s steps(3) ${n(-rand() * d)}s infinite"/>`;
  }
  return s;
}
// moldura em pixel (cantos em degrau)
function frame(x, y, w, h, { px = 4, outer = C.silver, inner = C.navy, fill = C.navy } = {}) {
  return `<path d="M${x + px} ${y}h${w - 2 * px}v${px}h${px}v${h - 2 * px}h${-px}v${px}h${-(w - 2 * px)}v${-px}h${-px}v${-(h - 2 * px)}h${px}z" fill="${outer}"/>
    <rect x="${x + px}" y="${y + px}" width="${w - 2 * px}" height="${h - 2 * px}" fill="${inner}"/>
    <rect x="${x + 2 * px}" y="${y + 2 * px}" width="${w - 4 * px}" height="${h - 4 * px}" fill="${fill}"/>`;
}
// faixa xadrez azul/prata que rola (chão)
function floor(y, w, h, px = 8, cls = "fl") {
  let d1 = "", d2 = "";
  for (let x = -2; x < w / px + 2; x++) for (let r = 0; r < h / px; r++) ((x + r) % 2 === 0 ? (d1 += `M${x * px} ${y + r * px}h${px}v${px}h${-px}z`) : (d2 += `M${x * px} ${y + r * px}h${px}v${px}h${-px}z`));
  return { style: `.${cls}{animation:${cls} .8s steps(2) infinite}@keyframes ${cls}{to{transform:translateX(${-2 * px}px)}}`, body: `<g class="${cls}"><path d="${d1}" fill="${C.blue}"/><path d="${d2}" fill="${C.silver}"/></g>` };
}

/* ───────────── HERO ───────────── */
function hero() {
  const W = 900, H = 440, rand = rng(4);
  const fl = floor(416, W, 24);
  const taglines = ["NODE.JS · NEXT.JS · LARAVEL · DOCKER", "AUTENTICAÇÃO · CONTROLE DE ACESSO · OWASP", "CO-FUNDADOR DA RDL DEVELOPMENT"];
  const style = `${BASE_STYLE}${fl.style}
    .can{animation:bob 1.6s steps(4) infinite}
    .cl{animation:cl 40s linear infinite}@keyframes cl{from{transform:translateX(0)}to{transform:translateX(-1100px)}}
    .tag{opacity:0;animation:tag 12s steps(1) infinite}@keyframes tag{0%{opacity:1}33%,100%{opacity:0}}
    .sun{animation:sun 2s steps(2) infinite}@keyframes sun{50%{opacity:.75}}`;
  const sunCells = [];
  for (let y = -16; y <= 16; y++) for (let x = -16; x <= 16; x++) if (x * x + y * y <= 250) sunCells.push([x + 16, y + 16]);
  const sunRing = [];
  for (let y = -19; y <= 19; y++) for (let x = -19; x <= 19; x++) { const r = x * x + y * y; if (r > 300 && r <= 361 && (x + y) % 2 === 0) sunRing.push([x + 19, y + 19]); }
  const clouds = [[60, 70], [380, 40], [560, 96], [980, 60], [1300, 84]].map(([x, y]) => sprite(CLOUD, { "#": C.navy2 }, 6, x, y)).join("");
  const body = `<defs><clipPath id="fr"><rect width="${W}" height="${H}"/></clipPath>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.night}"/><stop offset=".7" stop-color="${C.navy}"/><stop offset="1" stop-color="${C.blue}"/></linearGradient>
      <pattern id="dith" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="${C.blue}"/><rect x="4" y="4" width="4" height="4" fill="${C.blue}"/></pattern></defs>
    <g clip-path="url(#fr)">
      <rect width="${W}" height="${H}" fill="url(#sky)"/>
      <rect y="356" width="${W}" height="60" fill="url(#dith)" opacity=".55"/>
      ${stars(rand, 70, W, 300)}
      <g class="cl">${clouds}</g>
      <g class="sun"><path d="${cellsPath(sunRing, 6, 756 - 19 * 6, 214 - 19 * 6)}" fill="${C.yel2}"/></g>
      <path d="${cellsPath(sunCells, 6, 756 - 16 * 6, 214 - 16 * 6)}" fill="${C.yel}"/>
      ${fl.body}
      <rect y="410" width="${W}" height="6" fill="${C.night}"/>

      ${ptext("1P DANIEL", { x: 32, y: 22, px: 2, fill: C.white })}
      ${ptext("HI-SCORE 999999", { x: W / 2, y: 22, px: 2, fill: C.red, anchor: "middle" })}
      ${ptext("RDL DEV", { x: W - 32, y: 22, px: 2, fill: C.yel, anchor: "end" })}

      ${ptext("DANIEL", { x: 40, y: 80, px: 11, fill: C.yel, shadow: C.red })}
      ${ptext("MACIEL", { x: 40, y: 178, px: 11, fill: C.white, shadow: C.blue2 })}
      <rect x="40" y="276" width="${textW("FULL STACK · BACK-END & SEGURANÇA", 2.5) + 24}" height="34" fill="${C.red}"/>
      ${ptext("FULL STACK · BACK-END & SEGURANÇA", { x: 52, y: 285, px: 2.5, fill: C.white })}
      ${taglines.map((t, i) => ptext(t, { x: 40, y: 330, px: 2, fill: C.silver, cls: "tag", style: `animation-delay:${i * 4}s` })).join("")}
      ${ptext("▶ DEPLOY TE DÁ ASAS", { x: 40, y: 374, px: 3, fill: C.yel, cls: "blink" })}

      <g class="can">${canSVG(6, 690, 102)}${wings(5, 756, 170, 66)}</g>
    </g>
    <rect x="2" y="2" width="${W - 4}" height="${H - 4}" stroke="${C.silver}" stroke-width="4"/>`;
  write("hero.svg", svg(W, H, body, style, "Daniel Maciel — Full Stack, back-end e segurança"));
}

/* ───────────── TÍTULOS ───────────── */
function titles() {
  [
    ["sobre", "1-1", "SOBRE MIM", "PLAYER 1"],
    ["status", "1-2", "STATUS", "ATRIBUTOS DO PERSONAGEM"],
    ["projetos", "1-3", "SELECIONE A FASE", "PROJETOS"],
    ["inventario", "1-4", "INVENTÁRIO", "STACK EQUIPADA"],
    ["placar", "1-5", "PLACAR", "DADOS AO VIVO DO GITHUB"],
    ["contato", "1-6", "MULTIPLAYER", "BORA CONVERSAR"],
  ].forEach(([id, num, text, sub], i) => {
    const W = 900, H = 64;
    const body = `<rect width="${W}" height="${H}" fill="${C.navy}"/>
      <rect x="0" y="0" width="96" height="${H}" fill="${C.red}"/>
      ${ptext(num, { x: 48, y: 22, px: 3.4, fill: C.yel, anchor: "middle" })}
      ${ptext(text, { x: 120, y: 18, px: 4, fill: C.white, shadow: C.blue2 })}
      ${ptext(sub, { x: W - 46, y: 26, px: 2, fill: C.silver2, anchor: "end" })}
      <rect x="${W - 36}" y="24" width="10" height="16" fill="${C.yel}" class="blink" style="animation-delay:${n(i * 0.17)}s"/>
      <rect x="2" y="2" width="${W - 4}" height="${H - 4}" stroke="${C.silver}" stroke-width="4"/>`;
    write(`title-${id}.svg`, svg(W, H, body, BASE_STYLE, text));
  });
}

/* ───────────── SOBRE (CAIXA DE DIÁLOGO) ───────────── */
function dialog() {
  const W = 900, H = 262, PX = 2, LH = 28, X0 = 196, Y0 = 62, CH = 0.035;
  const lines = [
    ["OLÁ! EU SOU O DANIEL MACIEL.", C.yel],
    ["DEV FULL STACK COM FOCO EM BACK-END E SEGURANÇA.", C.white],
    ["CRIO APLICAÇÕES WEB COM NEXT.JS, NODE.JS E LARAVEL,", C.white],
    ["COM AUTENTICAÇÃO, CONTROLE DE ACESSO E OWASP.", C.white],
    ["CO-FUNDADOR DA RDL DEVELOPMENT ♥", C.red],
  ];
  let t = 0.8, clips = "", text = "";
  lines.forEach(([s, col], i) => {
    const y = Y0 + i * LH, len = [...s].length, start = t, cw = 6 * PX;
    const times = [0, start], vals = [0, 0];
    for (let k = 1; k <= len; k++) { times.push(start + k * CH); vals.push(k * cw); }
    t = start + len * CH + 0.45;
    clips += `<clipPath id="l${i}"><rect x="${X0 - 1}" y="${y - 6}" height="${7 * PX + 12}" width="0"><animate attributeName="width" calcMode="discrete" dur="TT" repeatCount="indefinite" values="${vals.join(";")}" keyTimes="KT${i}"/></rect></clipPath>`;
    lines[i].times = times;
    text += `<g clip-path="url(#l${i})">${ptext(s, { x: X0, y, px: PX, fill: col })}</g>`;
  });
  const T = n(t + 5);
  lines.forEach((l, i) => { clips = clips.replace(`KT${i}`, kt(l.times, T)); });
  clips = clips.replaceAll("TT", `${T}s`);
  const body = `<defs>${clips}</defs>
    <rect width="${W}" height="${H}" fill="${C.night}"/>
    ${frame(10, 26, W - 20, H - 36, { px: 4, outer: C.white, inner: C.night, fill: C.navy })}
    <rect x="34" y="8" width="${textW("DANIEL", 3) + 28}" height="34" fill="${C.red}"/>
    ${ptext("DANIEL", { x: 48, y: 15, px: 3, fill: C.white })}
    <rect x="36" y="58" width="136" height="172" fill="${C.night}"/>
    <g style="animation:bob 1.6s steps(4) infinite">${canSVG(3.4, 67, 76, { label: false })}${wings(2.6, 104, 112, 37)}</g>
    <g>${text}<animate attributeName="opacity" dur="${T}s" repeatCount="indefinite" values="1;1;0;0" keyTimes="0;${kt([T - 0.8, T - 0.3], T)};1"/></g>
    ${ptext("▼", { x: W - 50, y: H - 40, px: 3, fill: C.yel, cls: "blink" })}`;
  write("sobre.svg", svg(W, H, body, BASE_STYLE, "Olá! Eu sou o Daniel Maciel, dev full stack com foco em back-end e segurança, co-fundador da RDL Development."));
}

/* ───────────── STATUS ───────────── */
function status() {
  const W = 900, H = 236, SEG = 24, SW = 16, SG = 3, BX = 300;
  const stats = [
    ["BACK-END", 22, C.red], ["SEGURANÇA", 21, C.yel], ["BANCO DE DADOS", 18, C.sky], ["FRONT-END", 16, C.green], ["DEVOPS", 15, C.silver],
  ];
  const T = 6;
  let segs = "";
  stats.forEach(([label, v, col], i) => {
    const y = 34 + i * 38;
    segs += ptext(label, { x: 40, y: y + 3, px: 2.4, fill: C.white });
    for (let k = 0; k < SEG; k++) {
      const on = k < v, x = BX + k * (SW + SG);
      segs += `<rect x="${x}" y="${y}" width="${SW}" height="20" fill="${C.navy2}"/>`;
      if (on) segs += `<rect x="${x}" y="${y}" width="${SW}" height="20" fill="${col}" class="sg" style="animation-delay:${n(i * 0.15 + k * 0.05)}s"/><rect x="${x}" y="${y}" width="${SW}" height="4" fill="#fff" opacity=".35" class="sg" style="animation-delay:${n(i * 0.15 + k * 0.05)}s"/>`;
    }
    segs += ptext(`LV ${Math.round((v / SEG) * 99)}`, { x: W - 40, y: y + 3, px: 2.4, fill: col, anchor: "end" });
  });
  const style = `${BASE_STYLE}.sg{opacity:0;animation:sg ${T}s steps(1) infinite}@keyframes sg{0%{opacity:0}2%,90%{opacity:1}100%{opacity:0}}`;
  const body = `<rect width="${W}" height="${H}" fill="${C.navy}"/>${segs}
    <rect x="2" y="2" width="${W - 4}" height="${H - 4}" stroke="${C.silver}" stroke-width="4"/>`;
  write("status.svg", svg(W, H, body, style, "Atributos: back-end, segurança, banco de dados, front-end e DevOps"));
}

/* ───────────── FASE EM DESTAQUE: SIMULA SISU ───────────── */
function featured() {
  const W = 900, H = 540, T = 22, rand = rng(9);
  const VX = 60, VY = 96, VW = 540, VH = 312, IMG_H = Math.round((818 * VW) / 792), maxD = IMG_H - VH;
  const PX = 694, PY = 150, PW = 140, PH = 270, PIMG_H = Math.round((1825 * PW) / 242), maxM = PIMG_H - PH;
  const at = (f, m) => Math.round(f * m);
  const scroll = (stops) => `<animateTransform attributeName="transform" type="translate" dur="${T}s" repeatCount="indefinite" calcMode="discrete" values="${stops.map((s) => `0 ${-s[1]}`).join(";")}" keyTimes="${kt(stops.map((s) => s[0]), T)}"/>`;
  // rolagem em degraus (estilo 8-bit)
  const steps = (max, t0, t1, n0 = 8) => { const out = []; for (let k = 0; k <= n0; k++) out.push([t0 + ((t1 - t0) * k) / n0, at(k / n0, max)]); return out; };
  const deskStops = [[0, 0], ...steps(maxD, 3, 6), [6.1, maxD], ...steps(maxD, 13, 14.5).map(([t, v]) => [t, maxD - v]), [T - 0.01, 0]];
  const mobStops = [[0, 0], ...steps(maxM, 3.5, 9, 16), [9.1, maxM], ...steps(maxM, 14, 16, 8).map(([t, v]) => [t, maxM - v]), [T - 0.01, 0]];
  const chips = ["NEXT.JS", "EXPRESS", "PRISMA", "POSTGRESQL", "DOCKER", "IA"];
  let cx = 40;
  const chipEls = chips.map((c) => { const w = textW(c, 2) + 20; const s = `<rect x="${cx}" y="494" width="${w}" height="26" fill="${C.navy2}"/><rect x="${cx}" y="516" width="${w}" height="4" fill="${C.blue2}"/>${ptext(c, { x: cx + 10, y: 500, px: 2, fill: C.silver })}`; cx += w + 10; return s; }).join("");
  const style = `${BASE_STYLE}.coin{animation:bob 1s steps(2) infinite}`;
  const body = `<defs><clipPath id="vp"><rect x="${VX}" y="${VY}" width="${VW}" height="${VH}"/></clipPath><clipPath id="ph"><rect x="${PX}" y="${PY}" width="${PW}" height="${PH}"/></clipPath>
      <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${C.navy}"/><rect width="2" height="2" fill="${C.blue}"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    ${stars(rand, 26, W, 80)}
    ${ptext("FASE 1 · SIMULA SISU 2026", { x: 40, y: 28, px: 3.4, fill: C.yel, shadow: C.red })}
    <rect x="${W - 196}" y="22" width="156" height="34" fill="${C.night}"/><rect x="${W - 196}" y="22" width="156" height="34" stroke="${C.green}" stroke-width="3"/>
    <rect x="${W - 182}" y="33" width="12" height="12" fill="${C.green}" class="blink"/>
    ${ptext("NO AR", { x: W - 158, y: 32, px: 2.6, fill: C.green })}

    <!-- monitor -->
    ${frame(40, 76, 580, 352, { px: 6, outer: C.silver, inner: C.silver2, fill: C.night })}
    <g clip-path="url(#vp)"><image href="${jpg("sisu-d.jpg")}" x="${VX}" y="${VY}" width="${VW}" height="${IMG_H}" preserveAspectRatio="none">${scroll(deskStops)}</image></g>
    <rect x="${VX}" y="${VY}" width="${VW}" height="${VH}" fill="none" stroke="${C.night}" stroke-width="2"/>
    <rect x="290" y="428" width="80" height="18" fill="${C.silver2}"/><rect x="240" y="446" width="180" height="12" fill="${C.silver}"/>
    <rect x="590" y="412" width="8" height="8" fill="${C.green}" class="blink"/>

    <!-- celular -->
    ${frame(PX - 14, PY - 34, PW + 28, PH + 68, { px: 6, outer: C.silver, inner: C.silver2, fill: C.night })}
    <rect x="${PX + PW / 2 - 18}" y="${PY - 20}" width="36" height="6" fill="${C.silver2}"/>
    <g clip-path="url(#ph)"><image href="${jpg("sisu-m.jpg")}" x="${PX}" y="${PY}" width="${PW}" height="${PIMG_H}" preserveAspectRatio="none">${scroll(mobStops)}</image></g>
    <rect x="${PX + PW / 2 - 12}" y="${PY + PH + 12}" width="24" height="12" fill="${C.silver2}"/>

    ${chipEls}
    ${ptext("CLIQUE PARA JOGAR ▶", { x: W - 40, y: 504, px: 2, fill: C.yel, anchor: "end", cls: "blink" })}
    <rect x="2" y="2" width="${W - 4}" height="${H - 4}" stroke="${C.silver}" stroke-width="4"/>`;
  write("fase-sisu.svg", svg(W, H, body, style, "Simula SISU 2026 rodando num monitor e num celular em pixel art"));
}

/* ───────────── CARTAS DE FASE ───────────── */
function cards() {
  [
    { id: "rdl", fase: "FASE 2", title: "RDL DEVELOPMENT", tag: "NO AR", tagC: C.green, thumb: "rdl-px.png",
      desc: ["Startup de software que fundei com o Robson", "e o Luiz: sites, apps e sistemas sob medida."], chips: ["NEXT.JS", "NODE.JS", "SEGURANÇA"] },
    { id: "mindhealth", fase: "FASE 3", title: "MIND HEALTH", tag: "TCC", tagC: C.yel, thumb: "mind-px.png",
      desc: ["TCC sobre tecnologia e saúde mental: SPA em", "React + TypeScript e API Laravel com JWT."], chips: ["REACT", "LARAVEL", "JWT"] },
  ].forEach(({ id, fase, title, tag, tagC, thumb, desc, chips }, i) => {
    const W = 420, H = 330;
    let cx = 22;
    const chipEls = chips.map((c) => { const w = textW(c, 2) + 18; const s = `<rect x="${cx}" y="288" width="${w}" height="24" fill="${C.navy2}"/><rect x="${cx}" y="308" width="${w}" height="4" fill="${C.blue2}"/>${ptext(c, { x: cx + 9, y: 293, px: 2, fill: C.silver })}`; cx += w + 8; return s; }).join("");
    const style = `${BASE_STYLE}.sel{animation:sel 1.2s steps(1) infinite;animation-delay:${i * 0.6}s}@keyframes sel{0%,49%{stroke:${C.yel}}50%,100%{stroke:${C.red}}}`;
    const body = `${frame(0, 0, W, H, { px: 6, outer: C.silver, inner: C.silver2, fill: C.navy })}
      <image href="${png(thumb)}" x="18" y="18" width="384" height="174" preserveAspectRatio="xMidYMid slice" style="image-rendering:pixelated"/>
      <rect x="18" y="18" width="384" height="174" stroke="${C.night}" stroke-width="3"/>
      <rect x="18" y="18" width="${textW(fase, 2.4) + 20}" height="30" fill="${C.red}"/>${ptext(fase, { x: 28, y: 25, px: 2.4, fill: C.white })}
      <rect x="${402 - textW(tag, 2.4) - 20}" y="18" width="${textW(tag, 2.4) + 20}" height="30" fill="${C.night}"/>${ptext(tag, { x: 392, y: 25, px: 2.4, fill: tagC, anchor: "end" })}
      ${ptext(title, { x: 22, y: 210, px: 3.4, fill: C.yel, shadow: C.red })}
      ${desc.map((d, k) => `<text x="22" y="${256 + k * 18}" font-family="${MONO}" font-size="12.5" fill="${C.white}" shape-rendering="auto">${esc(d)}</text>`).join("")}
      ${chipEls}
      <rect x="3" y="3" width="${W - 6}" height="${H - 6}" stroke-width="3" class="sel" fill="none"/>`;
    write(`fase-${id}.svg`, svg(W, H, body, style, title));
  });
}

/* ───────────── INVENTÁRIO ───────────── */
function inventory() {
  const items = [["nodejs", "NODE.JS"], ["nextjs", "NEXT.JS"], ["react", "REACT"], ["ts", "TYPESCRIPT"], ["js", "JAVASCRIPT"], ["laravel", "LARAVEL"], ["express", "EXPRESS"], ["prisma", "PRISMA"],
    ["postgres", "POSTGRESQL"], ["mysql", "MYSQL"], ["docker", "DOCKER"], ["nginx", "NGINX"], ["linux", "LINUX"], ["git", "GIT"], ["vercel", "VERCEL"], ["tailwind", "TAILWIND"]];
  const W = 900, H = 300, S = 84, G = 12, COLS = 8, X0 = (W - (COLS * S + (COLS - 1) * G)) / 2, Y0 = 28, STEP = 1.1, T = n(STEP * items.length);
  const pos = items.map((_, i) => [X0 + (i % COLS) * (S + G), Y0 + Math.floor(i / COLS) * (S + G)]);
  const kf = pos.map(([x, y], i) => `${n((i / items.length) * 100)}%{transform:translate(${x}px,${y}px)}`).join("");
  const p = (s) => n((s / T) * 100);
  const style = `${BASE_STYLE}
    .cur{animation:cur ${T}s steps(1) infinite}@keyframes cur{${kf}100%{transform:translate(${pos[0][0]}px,${pos[0][1]}px)}}
    .nm{opacity:0;animation:nm ${T}s steps(1) infinite}@keyframes nm{0%{opacity:1}${p(STEP)}%,100%{opacity:0}}`;
  const defs = items.map(([ic]) => `<image id="i-${ic}" width="56" height="56" href="${icon64(ic)}"/>`).join("");
  const slots = items.map(([ic], i) => { const [x, y] = pos[i]; return `${frame(x, y, S, S, { px: 4, outer: C.silver2, inner: C.night, fill: C.navy2 })}<use href="#i-${ic}" x="${x + 14}" y="${y + 14}"/>`; }).join("");
  const cursor = `<g class="cur"><path d="M-6 -6h24v6h-18v18h-6zM${S + 6} -6v24h-6v-18h-18v-6zM-6 ${S + 6}v-24h6v18h18v6zM${S + 6} ${S + 6}h-24v-6h18v-18h6z" fill="${C.yel}"/></g>`;
  const names = items.map(([, nm], i) => ptext(`▶ ${nm}`, { x: W / 2, y: 236, px: 3.4, fill: C.yel, anchor: "middle", cls: "nm", style: `animation-delay:${n(i * STEP)}s` })).join("");
  const body = `<defs>${defs}</defs><rect width="${W}" height="${H}" fill="${C.navy}"/>${slots}${cursor}
    <rect x="${X0}" y="220" width="${W - 2 * X0}" height="54" fill="${C.night}"/>${names}
    <rect x="2" y="2" width="${W - 4}" height="${H - 4}" stroke="${C.silver}" stroke-width="4"/>`;
  write("inventario.svg", svg(W, H, body, style, `Stack: ${items.map((i) => i[1]).join(", ")}`));
}

/* ───────────── BOTÕES DE CONTATO ───────────── */
function buttons() {
  [["linkedin", "LINKEDIN", "DANIEL MACIEL", C.blue2, C.blue], ["rdl", "RDL DEV", "RDLDEVELOPMENT.DEV", C.red, C.red2], ["github", "GITHUB", "@DANSMACIELL", C.silver2, "#5b6475"]]
    .forEach(([id, label, sub, c, dark], i) => {
      const W = 260, H = 96;
      const style = `${BASE_STYLE}.top{animation:pr 3s steps(1) infinite;animation-delay:${i}s}@keyframes pr{0%,10%,20%,100%{transform:translateY(0)}11%,19%{transform:translateY(8px)}}`;
      const body = `<rect width="${W}" height="${H}" fill="none"/>
        ${frame(0, 10, W, H - 10, { px: 4, outer: C.night, inner: dark, fill: dark })}
        <g class="top">${frame(0, 0, W, H - 14, { px: 4, outer: C.night, inner: C.white, fill: c })}
        ${ptext(label, { x: W / 2, y: 18, px: 3.6, fill: C.white, anchor: "middle", shadow: C.night })}
        ${ptext(sub, { x: W / 2, y: 52, px: 2, fill: C.white, anchor: "middle" })}</g>`;
      write(`btn-${id}.svg`, svg(W, H, body, style, label));
    });
}

/* ───────────── RODAPÉ ───────────── */
function footer() {
  const W = 900, H = 230, rand = rng(12);
  const fl = floor(170, W, 24);
  const style = `${BASE_STYLE}${fl.style}
    .run{animation:run 9s linear infinite}@keyframes run{from{transform:translateX(-140px)}to{transform:translateX(1000px)}}
    .fly{animation:run 9s linear -1.2s infinite}`;
  const body = `<rect width="${W}" height="${H}" fill="${C.night}"/>
    ${stars(rand, 40, W, 150)}
    ${ptext("OBRIGADO POR JOGAR!", { x: W / 2, y: 34, px: 5, fill: C.yel, shadow: C.red, anchor: "middle" })}
    ${ptext("DEPLOY TE DÁ ASAS", { x: W / 2, y: 92, px: 2.4, fill: C.white, anchor: "middle", cls: "blink" })}
    <g class="run"><g class="fa">${sprite(BULL_A, { R: C.red, "#": C.yel }, 5, 0, 130)}</g><g class="fb">${sprite(BULL_B, { R: C.red, "#": C.yel }, 5, 0, 130)}</g></g>
    <g class="fly"><g transform="translate(-10 0)">${canSVG(1.6, 0, 112, { label: false })}${wings(1.4, 17.6, 128, 17.6)}</g></g>
    ${fl.body}
    <rect y="194" width="${W}" height="36" fill="${C.navy}"/>
    ${ptext("(C) 2026 DANIEL MACIEL · RDL DEVELOPMENT", { x: W / 2, y: 206, px: 2, fill: C.silver, anchor: "middle" })}
    <rect x="2" y="2" width="${W - 4}" height="${H - 4}" stroke="${C.silver}" stroke-width="4"/>`;
  write("footer.svg", svg(W, H, body, style, "Obrigado por jogar!"));
}

hero();
titles();
dialog();
status();
featured();
cards();
inventory();
buttons();
footer();

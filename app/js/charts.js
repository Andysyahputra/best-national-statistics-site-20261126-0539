// Nusantara Numbers — hand-drawn canvas charts. Zero dependencies: every
// bar, line and label is drawn with the Canvas 2D API. Colours match the site
// palette (teal #006D6F, coral #E85D4A for down/bad, seafoam #4EC9B0 for up/good).

const TEAL = "#006d6f";
const CORAL = "#e85d4a";
const SEAFOAM = "#4ec9b0";
const INK = "#1a1a2e";
const MUTED = "#5a5a6e";
const GRID = "#e3d5be";

// Size the canvas to its CSS box (times devicePixelRatio for crisp lines)
// and return a 2d context already scaled to CSS pixels.
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(50, Math.round(rect.width));
  const height = Math.max(50, Math.round(rect.height));
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

function niceMax(values) {
  const max = Math.max(0, ...values);
  if (max <= 0) return 1;
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / step) * step;
}

// Round step up to a "nice" number (1, 2, 2.5, 5 or 10 times a power of ten),
// so axis labels read 0, 2, 4, 6 — never 3.98 or 1.97.
function niceStep(raw) {
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / power;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return m * power;
}

// Round axis bounds [lo, hi] out to whole steps; returns { lo, hi, step }.
function niceAxis(lo, hi) {
  const step = niceStep((hi - lo) / 4 || 1);
  return {
    lo: Math.floor(lo / step) * step,
    hi: Math.ceil(hi / step) * step,
    step,
  };
}

// Vertical bar chart. `values` may include negatives (a zero line is drawn).
// opts: { labels, values, format(v) -> string, colorFor(v, i) -> colour, unit }
export function drawBarChart(canvas, opts) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 46, right: 12, top: 26, bottom: 30 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const axis = niceAxis(Math.min(0, ...opts.values), niceMax(opts.values));
  const lo = axis.lo;
  const hi = axis.hi;
  const span = hi - lo;
  const y = (v) => pad.top + ((hi - v) / span) * plotH;
  const zeroY = y(0);

  ctx.font = "12px -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  // Gridlines + y-axis labels at round steps.
  for (let v = lo; v <= hi + 1e-9; v += axis.step) {
    const yy = y(v);
    ctx.strokeStyle = GRID;
    ctx.beginPath();
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(width - pad.right, yy);
    ctx.stroke();
    ctx.fillStyle = MUTED;
    ctx.fillText(opts.format(v), pad.left - 8, yy);
  }
  // Zero line.
  ctx.strokeStyle = INK;
  ctx.beginPath();
  ctx.moveTo(pad.left, zeroY);
  ctx.lineTo(width - pad.right, zeroY);
  ctx.stroke();

  const n = opts.values.length;
  const slot = plotW / n;
  const barW = Math.min(64, slot * 0.58);
  opts.values.forEach((v, i) => {
    const x = pad.left + slot * i + (slot - barW) / 2;
    const top = y(Math.max(v, 0));
    const bottom = y(Math.min(v, 0));
    ctx.fillStyle = opts.colorFor ? opts.colorFor(v, i) : TEAL;
    ctx.fillRect(x, top, barW, Math.max(2, bottom - top));
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(opts.format(v, i), x + barW / 2, top - 5);
    ctx.fillStyle = MUTED;
    ctx.textBaseline = "top";
    ctx.fillText(String(opts.labels[i]), x + barW / 2, height - pad.bottom + 8);
  });
}

// Line chart with dots and value labels. opts: { labels, values, format(v), unit }
export function drawLineChart(canvas, opts) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 52, right: 18, top: 26, bottom: 30 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const lo = Math.min(...opts.values);
  const hi = Math.max(...opts.values);
  const axis = niceAxis(
    lo - (hi - lo) * 0.25,
    hi + (hi - lo) * 0.25,
  );
  const span = axis.hi - axis.lo;
  const x = (i) => pad.left + (plotW * i) / (opts.values.length - 1);
  const y = (v) => pad.top + ((axis.hi - v) / span) * plotH;

  ctx.font = "12px -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let v = axis.lo; v <= axis.hi + 1e-9; v += axis.step) {
    const yy = y(v);
    ctx.strokeStyle = GRID;
    ctx.beginPath();
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(width - pad.right, yy);
    ctx.stroke();
    ctx.fillStyle = MUTED;
    ctx.fillText(opts.format(v), pad.left - 8, yy);
  }

  // Line.
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.beginPath();
  opts.values.forEach((v, i) => {
    if (i === 0) ctx.moveTo(x(i), y(v));
    else ctx.lineTo(x(i), y(v));
  });
  ctx.stroke();
  ctx.lineWidth = 1;

  // Dots + value labels.
  opts.values.forEach((v, i) => {
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.arc(x(i), y(v), 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x(i), y(v), 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(opts.format(v), x(i), y(v) - 9);
    ctx.fillStyle = MUTED;
    ctx.textBaseline = "top";
    ctx.fillText(String(opts.labels[i]), x(i), height - pad.bottom + 8);
  });
}

// Horizontal bar chart. opts: { labels, values, format(v) -> string, maxValue }
export function drawHBarChart(canvas, opts) {
  const { ctx, width, height } = setupCanvas(canvas);
  const pad = { left: 8, right: 58, top: 8, bottom: 8 };
  const n = opts.values.length;
  const rowH = (height - pad.top - pad.bottom) / n;
  const barH = Math.min(26, rowH * 0.52);
  const max = opts.maxValue || niceMax(opts.values);

  ctx.font = "13px -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
  opts.values.forEach((v, i) => {
    const cy = pad.top + rowH * i + rowH / 2;
    const label = String(opts.labels[i]);
    const valueText = opts.format(v);
    // Label above the bar, value at the bar's end.
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(label, pad.left, cy - barH / 2 - 3);
    const barX = pad.left;
    const barW = ((width - pad.left - pad.right) * v) / max;
    ctx.fillStyle = i === 0 ? TEAL : SEAFOAM;
    ctx.fillRect(barX, cy - barH / 2, Math.max(2, barW), barH);
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(valueText, barX + Math.max(2, barW) + 8, cy);
  });
}

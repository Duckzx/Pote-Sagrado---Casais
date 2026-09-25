// Share card rendered directly on a <canvas> (no DOM screenshot libraries):
// reliable on iOS/Android, independent of CSS color formats, and fast enough
// to be ready before the user taps "share" (keeps the gesture valid on iOS).

export type ShareFormat = "story" | "feed";

export interface ShareCardData {
  percentage: number;
  totalSaved: number;
  goalAmount: number;
  goalLabel: string;
  headline: string;
  subline: string;
  siteUrl: string;
  format: ShareFormat;
}

const brl = (v: number) => Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Wraps text to max width, returns lines. */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines = 2) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    cut[maxLines - 1] = cut[maxLines - 1].replace(/\s*\S*$/, "") + "…";
    return cut;
  }
  return lines;
}

/** Jar silhouette (same shape as the app icon), scaled into a box. */
function jarPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  // Designed on a 100x110 grid
  const sx = w / 100;
  const sy = h / 110;
  const P = (px: number, py: number) => [x + px * sx, y + py * sy] as const;
  ctx.beginPath();
  ctx.moveTo(...P(33, 12));
  ctx.lineTo(...P(33, 22));
  ctx.bezierCurveTo(...P(33, 34), ...P(10, 38), ...P(10, 58));
  ctx.lineTo(...P(10, 96));
  ctx.quadraticCurveTo(...P(10, 108), ...P(22, 108));
  ctx.lineTo(...P(78, 108));
  ctx.quadraticCurveTo(...P(90, 108), ...P(90, 96));
  ctx.lineTo(...P(90, 58));
  ctx.bezierCurveTo(...P(90, 38), ...P(67, 34), ...P(67, 22));
  ctx.lineTo(...P(67, 12));
  ctx.closePath();
}

async function ensureFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.race([
    Promise.all([
      document.fonts.load('600 120px "Cormorant Garamond"'),
      document.fonts.load('italic 400 60px "Cormorant Garamond"'),
      document.fonts.load('700 40px "Inter"'),
      document.fonts.load('500 40px "Inter"'),
    ]),
    new Promise((r) => setTimeout(r, 1500)),
  ]).catch(() => {});
}

export async function renderShareCard(data: ShareCardData): Promise<Blob> {
  await ensureFonts();
  const W = 1080;
  const H = data.format === "story" ? 1920 : 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const primary = cssVar("--theme-primary", "#C9677F");
  const gold = cssVar("--theme-gold", "#D4A574");
  const serif = '"Cormorant Garamond", Georgia, serif';
  const sans = 'Inter, -apple-system, "Segoe UI", sans-serif';

  // Background: deep, premium gradient with soft color blobs
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1B0F14");
  bg.addColorStop(1, "#2A1620");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const blob = (cx: number, cy: number, r: number, color: string, alpha: number) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.globalAlpha = 1;
  };
  blob(W * 0.15, H * 0.12, 620, primary, 0.55);
  blob(W * 0.95, H * 0.55, 700, gold, 0.35);
  blob(W * 0.3, H * 0.95, 560, primary, 0.35);

  // Sparkles
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  const sparkle = (x: number, y: number, s: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.quadraticCurveTo(x, y, x + s, y);
    ctx.quadraticCurveTo(x, y, x, y + s);
    ctx.quadraticCurveTo(x, y, x - s, y);
    ctx.quadraticCurveTo(x, y, x, y - s);
    ctx.fill();
  };
  [[90, 150, 18], [960, 120, 26], [880, 820, 14], [170, 900, 12], [960, H - 420, 20]].forEach(([x, y, s]) => sparkle(x, y, s));

  const top = data.format === "story" ? 220 : 110;

  // Header
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = `700 30px ${sans}`;
  ctx.letterSpacing = "10px";
  ctx.fillText("POTE SAGRADO", W / 2, top);
  ctx.letterSpacing = "0px";

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `italic 400 78px ${serif}`;
  wrap(ctx, data.headline, W - 200, 2).forEach((line, i) => ctx.fillText(line, W / 2, top + 110 + i * 84));

  // Jar with fill level
  const jarW = data.format === "story" ? 560 : 440;
  const jarH = jarW * 1.1;
  const jarX = (W - jarW) / 2;
  const jarY = data.format === "story" ? 560 : 360;
  const pct = Math.max(0, Math.min(100, data.percentage));
  // A little liquid is always visible, so early progress still looks alive
  const visualPct = pct === 0 ? 0 : Math.max(10, pct);

  // glow
  blob(W / 2, jarY + jarH * 0.6, jarW * 0.8, gold, 0.35);

  ctx.save();
  jarPath(ctx, jarX, jarY, jarW, jarH);
  ctx.clip();
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(jarX, jarY, jarW, jarH);
  const innerTop = jarY + jarH * 0.2;
  const innerBottom = jarY + jarH * 0.98;
  const fillY = innerBottom - (innerBottom - innerTop) * (visualPct / 100);
  const liquid = ctx.createLinearGradient(0, fillY, 0, innerBottom);
  liquid.addColorStop(0, gold);
  liquid.addColorStop(1, primary);
  ctx.fillStyle = liquid;
  // wavy surface
  ctx.beginPath();
  ctx.moveTo(jarX, fillY);
  for (let x = 0; x <= jarW; x += 10) {
    ctx.lineTo(jarX + x, fillY + Math.sin(x / 38) * 10);
  }
  ctx.lineTo(jarX + jarW, jarY + jarH);
  ctx.lineTo(jarX, jarY + jarH);
  ctx.closePath();
  ctx.fill();
  // coins
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (let i = 0; i < 9; i++) {
    const cx = jarX + jarW * (0.2 + ((i * 37) % 60) / 100);
    const cy = fillY + 40 + ((i * 53) % Math.max(40, innerBottom - fillY - 60));
    if (cy < innerBottom - 20) {
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + (i % 3) * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // jar outline + lid + shine
  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineJoin = "round";
  jarPath(ctx, jarX, jarY, jarW, jarH);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  roundRect(ctx, jarX + jarW * 0.28, jarY - jarH * 0.02, jarW * 0.44, jarH * 0.09, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.45)";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(jarX + jarW * 0.2, jarY + jarH * 0.46);
  ctx.lineTo(jarX + jarW * 0.2, jarY + jarH * 0.58);
  ctx.stroke();

  // Percentage
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `600 ${data.format === "story" ? 190 : 150}px ${serif}`;
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 30;
  ctx.fillText(`${Math.round(pct)}%`, W / 2, jarY + jarH * 0.72);
  ctx.shadowBlur = 0;

  // Goal + amounts
  let y = jarY + jarH + (data.format === "story" ? 130 : 95);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `400 58px ${serif}`;
  wrap(ctx, data.subline, W - 200, 2).forEach((line, i) => ctx.fillText(line, W / 2, y + i * 64));
  y += data.subline && ctx.measureText(data.subline).width > W - 200 ? 140 : 90;

  if (data.goalAmount > 0) {
    ctx.fillStyle = gold;
    ctx.font = `700 40px ${sans}`;
    ctx.fillText(`${brl(data.totalSaved)}  de  ${brl(data.goalAmount)}`, W / 2, y);
    y += 60;
    // progress bar
    const bw = W - 280;
    roundRect(ctx, 140, y, bw, 22, 11);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();
    roundRect(ctx, 140, y, Math.max(22, (bw * pct) / 100), 22, 11);
    const bar = ctx.createLinearGradient(140, 0, 140 + bw, 0);
    bar.addColorStop(0, primary);
    bar.addColorStop(1, gold);
    ctx.fillStyle = bar;
    ctx.fill();
  }

  // Footer call to action (the organic growth loop)
  const fy = H - (data.format === "story" ? 250 : 170);
  roundRect(ctx, 120, fy, W - 240, 150, 75);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 34px ${sans}`;
  ctx.fillText("Crie o seu pote grátis ✨", W / 2, fy + 62);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `500 30px ${sans}`;
  ctx.fillText(data.siteUrl.replace(/^https?:\/\//, ""), W / 2, fy + 108);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"),
  );
}

/**
 * Composite the WebGL frame onto a branded background with a caption and download it as PNG.
 * `source` must have been rendered in the same task (see CaptureBridge).
 */
export function downloadSceneImage(
  source: HTMLCanvasElement,
  { title, subtitle, filename }: { title: string; subtitle: string; filename: string },
) {
  const { width, height } = source;
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d");
  if (!ctx) return;

  const bg = ctx.createRadialGradient(width / 2, height * 0.45, 0, width / 2, height * 0.45, Math.max(width, height) * 0.7);
  bg.addColorStop(0, "#23252d");
  bg.addColorStop(1, "#0e0f13");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0);

  const size = Math.round(Math.max(16, height / 36));
  // Scrim so the caption stays readable over any geometry.
  const scrim = ctx.createLinearGradient(0, height - size * 6, 0, height);
  scrim.addColorStop(0, "rgba(14,15,19,0)");
  scrim.addColorStop(1, "rgba(14,15,19,0.85)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, height - size * 6, width, size * 6);
  const x = size * 1.5;
  ctx.fillStyle = "#f4f5f7";
  ctx.font = `600 ${size}px system-ui, sans-serif`;
  ctx.fillText(title, x, height - size * 2.4);
  ctx.fillStyle = "#c8f046";
  ctx.font = `500 ${Math.round(size * 0.8)}px system-ui, sans-serif`;
  ctx.fillText(subtitle, x, height - size * 1.2);

  out.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }, "image/png");
}

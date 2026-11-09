import { PhotoAdjustments, LayerItem } from '../types/editor';

/**
 * Generate CSS filter string from adjustments
 */
export function getCssFilterString(adj: PhotoAdjustments): string {
  const b = 1 + adj.brightness / 100;
  const c = 1 + adj.contrast / 100;
  const s = 1 + adj.saturation / 100;
  const bl = adj.blur ? `blur(${adj.blur}px)` : '';

  // Exposure affects brightness scale
  const expMultiplier = Math.pow(2, adj.exposure / 50);
  const finalBrightness = Math.max(0, b * expMultiplier);

  // Hue-rotate approximation for temperature/tint
  const hue = adj.temperature * 0.35 + adj.tint * 0.25;
  const sepia = adj.temperature > 0 ? (adj.temperature / 100) * 0.3 : 0;

  return `brightness(${finalBrightness}) contrast(${c}) saturate(${s}) hue-rotate(${hue}deg) sepia(${sepia}) ${bl}`.trim();
}

/**
 * Loads an image from a URL or Data URI safely
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Render complete edited composition onto a high-resolution Canvas and export as DataURL or Blob
 */
export async function renderCompositionToCanvas(params: {
  imageSrc: string;
  adjustments: PhotoAdjustments;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  layers?: LayerItem[];
  targetScale?: number; // 1 = native, 2 = 2x, 4 = 4K
  format?: 'image/jpeg' | 'image/png';
  quality?: number;
}): Promise<{ dataUrl: string; width: number; height: number; blob: Blob }> {
  const {
    imageSrc,
    adjustments,
    rotation,
    flipH,
    flipV,
    layers = [],
    targetScale = 1,
    format = 'image/jpeg',
    quality = 0.92,
  } = params;

  const img = await loadImage(imageSrc);

  // Determine base dimensions based on rotation
  const isRotated90or270 = rotation % 180 !== 0;
  const baseW = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
  const baseH = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

  const finalWidth = Math.round(baseW * targetScale);
  const finalHeight = Math.round(baseH * targetScale);

  const canvas = document.createElement('canvas');
  canvas.width = finalWidth;
  canvas.height = finalHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo inicializar el contexto 2D de Canvas.');
  }

  ctx.save();

  // If JPEG, fill with black or dark background in case of transparent cutouts
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#121215';
    ctx.fillRect(0, 0, finalWidth, finalHeight);
  }

  // Apply Transformations (Rotate & Flip)
  ctx.translate(finalWidth / 2, finalHeight / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  // Apply CSS Filter on context
  const cssFilter = getCssFilterString(adjustments);
  if ('filter' in ctx) {
    (ctx as any).filter = cssFilter;
  }

  const drawW = isRotated90or270 ? finalHeight : finalWidth;
  const drawH = isRotated90or270 ? finalWidth : finalHeight;
  ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

  // Reset filter for layers
  if ('filter' in ctx) {
    (ctx as any).filter = 'none';
  }
  ctx.restore();

  // Vignette overlay
  if (adjustments.vignette > 0) {
    const radius = Math.max(finalWidth, finalHeight) * 0.75;
    const grad = ctx.createRadialGradient(
      finalWidth / 2,
      finalHeight / 2,
      radius * 0.3,
      finalWidth / 2,
      finalHeight / 2,
      radius
    );
    const alpha = (adjustments.vignette / 100) * 0.85;
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${alpha})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, finalWidth, finalHeight);
  }

  // Render overlay layers if present
  for (const layer of layers) {
    if (!layer.visible) continue;

    ctx.save();
    ctx.globalAlpha = (layer.opacity ?? 100) / 100;

    const layerX = (layer.x / 100) * finalWidth;
    const layerY = (layer.y / 100) * finalHeight;

    ctx.translate(layerX, layerY);
    if (layer.rotation) {
      ctx.rotate((layer.rotation * Math.PI) / 180);
    }
    if (layer.scale && layer.scale !== 1) {
      ctx.scale(layer.scale, layer.scale);
    }

    if (layer.type === 'text' && layer.content) {
      const fontSize = (layer.fontSize || 36) * targetScale;
      ctx.font = `bold ${fontSize}px ${layer.fontFamily || 'Roboto, sans-serif'}`;
      ctx.fillStyle = layer.color || '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 8 * targetScale;
      ctx.fillText(layer.content, 0, 0);
    } else if (layer.type === 'shape' && layer.content === 'star') {
      const r1 = 30 * targetScale;
      const r2 = 14 * targetScale;
      drawStar(ctx, 0, 0, 5, r1, r2, layer.color || '#FFFFFF');
    } else if (layer.type === 'shape' && layer.width && layer.height) {
      ctx.fillStyle = layer.color || '#8B5CF6';
      const w = layer.width * targetScale;
      const h = layer.height * targetScale;
      ctx.fillRect(-w / 2, -h / 2, w, h);
    }

    ctx.restore();
  }

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        const dataUrl = canvas.toDataURL(format, quality);
        resolve({
          dataUrl,
          width: finalWidth,
          height: finalHeight,
          blob: blob || new Blob(),
        });
      },
      format,
      quality
    );
  });
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  color: string
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fill();
}

/**
 * AI Magic Eraser / Inpainting simulation on Canvas
 * Smooths and propagates surrounding texture into the masked areas seamlessly
 */
export async function processObjectEraser(
  sourceImageSrc: string,
  maskCanvas: HTMLCanvasElement
): Promise<string> {
  const img = await loadImage(sourceImageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceImageSrc;

  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Read mask scaled to image dimensions
  const tempMask = document.createElement('canvas');
  tempMask.width = canvas.width;
  tempMask.height = canvas.height;
  const mCtx = tempMask.getContext('2d');
  if (!mCtx) return sourceImageSrc;
  mCtx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
  const maskData = mCtx.getImageData(0, 0, canvas.width, canvas.height).data;

  const w = canvas.width;
  const h = canvas.height;

  // Diffusion pass for inpainting
  const isMasked = new Uint8Array(w * h);
  let hasMaskedPixels = false;
  for (let i = 0; i < w * h; i++) {
    // If mask has red/alpha painted
    if (maskData[i * 4 + 3] > 30 && (maskData[i * 4] > 80 || maskData[i * 4 + 1] > 80)) {
      isMasked[i] = 1;
      hasMaskedPixels = true;
    }
  }

  if (!hasMaskedPixels) return sourceImageSrc;

  // 1st pass: Average surrounding border pixels
  const passes = 3;
  for (let p = 0; p < passes; p++) {
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        if (isMasked[idx] === 1) {
          let r = 0, g = 0, b = 0, count = 0;
          const neighbors = [
            (y - 1) * w + x,
            (y + 1) * w + x,
            y * w + (x - 1),
            y * w + (x + 1),
            (y - 2) * w + x,
            (y + 2) * w + x,
          ];
          for (const n of neighbors) {
            if (n >= 0 && n < w * h) {
              const pi = n * 4;
              r += data[pi];
              g += data[pi + 1];
              b += data[pi + 2];
              count++;
            }
          }
          if (count > 0) {
            const pi = idx * 4;
            data[pi] = Math.round(r / count);
            data[pi + 1] = Math.round(g / count);
            data[pi + 2] = Math.round(b / count);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * AI Background Remover
 * Isolates foreground subject and returns transparent PNG or composite
 */
export async function processBackgroundRemoval(
  sourceImageSrc: string,
  backgroundStyle: 'transparent' | 'gradient_purple' | 'studio_black' | 'cyberpunk' = 'transparent'
): Promise<string> {
  const img = await loadImage(sourceImageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceImageSrc;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Sample corner background color
  const bgR = (d[0] + d[(w - 1) * 4] + d[(h - 1) * w * 4]) / 3;
  const bgG = (d[1] + d[(w - 1) * 4 + 1] + d[(h - 1) * w * 4 + 1]) / 3;
  const bgB = (d[2] + d[(w - 1) * 4 + 2] + d[(h - 1) * w * 4 + 2]) / 3;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];

      const diff = Math.sqrt(
        Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
      );

      // Distance from center weight (subjects are typically centered)
      const dx = (x - w / 2) / (w / 2);
      const dy = (y - h / 2) / (h / 2);
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      if (diff < 45 && distFromCenter > 0.45) {
        d[i + 3] = 0; // Alpha transparent
      } else if (diff < 70 && distFromCenter > 0.6) {
        d[i + 3] = Math.max(0, Math.min(255, (diff - 45) * 10));
      }
    }
  }

  const cutoutCanvas = document.createElement('canvas');
  cutoutCanvas.width = w;
  cutoutCanvas.height = h;
  const cCtx = cutoutCanvas.getContext('2d');
  if (!cCtx) return sourceImageSrc;
  cCtx.putImageData(imgData, 0, 0);

  if (backgroundStyle === 'transparent') {
    return cutoutCanvas.toDataURL('image/png');
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = w;
  finalCanvas.height = h;
  const fCtx = finalCanvas.getContext('2d');
  if (!fCtx) return cutoutCanvas.toDataURL('image/png');

  if (backgroundStyle === 'gradient_purple') {
    const grad = fCtx.createRadialGradient(w / 2, h * 0.4, 50, w / 2, h / 2, w * 0.8);
    grad.addColorStop(0, '#7E46C7');
    grad.addColorStop(0.6, '#3E1B71');
    grad.addColorStop(1, '#121215');
    fCtx.fillStyle = grad;
    fCtx.fillRect(0, 0, w, h);
  } else if (backgroundStyle === 'studio_black') {
    fCtx.fillStyle = '#171717';
    fCtx.fillRect(0, 0, w, h);
  } else if (backgroundStyle === 'cyberpunk') {
    const grad = fCtx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0F0C29');
    grad.addColorStop(0.5, '#302B63');
    grad.addColorStop(1, '#24243E');
    fCtx.fillStyle = grad;
    fCtx.fillRect(0, 0, w, h);
  }

  fCtx.drawImage(cutoutCanvas, 0, 0);
  return finalCanvas.toDataURL('image/jpeg', 0.95);
}

/**
 * AI Super-Resolution & Clarity Enhancement
 * Unsharp mask convolution & micro-contrast boost
 */
export async function processEnhancement(sourceImageSrc: string): Promise<string> {
  const img = await loadImage(sourceImageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceImageSrc;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = imgData.data;
  const w = canvas.width;
  const h = canvas.height;

  // Unsharp mask kernel: [0, -1, 0, -1, 5, -1, 0, -1, 0]
  const copy = new Uint8ClampedArray(d);
  const amount = 0.55;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = ((y - 1) * w + x) * 4 + c;
        const bottom = ((y + 1) * w + x) * 4 + c;
        const left = (y * w + (x - 1)) * 4 + c;
        const right = (y * w + (x + 1)) * 4 + c;
        const center = i + c;

        const laplacian = 4 * copy[center] - copy[top] - copy[bottom] - copy[left] - copy[right];
        d[center] = Math.min(255, Math.max(0, copy[center] + laplacian * amount));
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.95);
}

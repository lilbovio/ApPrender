/**
 * imageUtils — client-side avatar photo compression.
 * The result is a JPEG data URL small enough to store in `avatar` (server JSON limit is 10 MB).
 */

const QUALITIES = [0.85, 0.75, 0.65, 0.55, 0.45];
const MAX_SIDE_FALLBACK = 192;

function codedError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/** Decoded size in bytes of a base64 data URL. */
function dataUrlBytes(dataUrl) {
  return Math.ceil((dataUrl.length - dataUrl.indexOf(",") - 1) * 3 / 4);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(codedError("NOT_IMAGE", "No pudimos leer la imagen."));
    image.src = url;
  });
}

/** Draws the image scaled so its longer side is at most maxSide, on a white background. */
function drawScaled(image, maxSide) {
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  // White first: transparent PNG pixels would otherwise turn black in JPEG.
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  return { canvas, width, height };
}

/** Tries each JPEG quality at one size; returns the first result within maxBytes, or null. */
function encodeWithinBudget(image, maxSide, maxBytes) {
  const { canvas, width, height } = drawScaled(image, maxSide);
  for (const quality of QUALITIES) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    const bytes = dataUrlBytes(dataUrl);
    if (bytes <= maxBytes) return { dataUrl, bytes, width, height };
  }
  return null;
}

/**
 * compressImageToDataUrl — turns an image File into a JPEG data URL under maxBytes.
 * Throws an Error with code "NOT_IMAGE" for non-image or unreadable files and
 * code "TOO_BIG" when even the smallest attempt is over budget.
 */
export async function compressImageToDataUrl(file, { maxSide = 256, maxBytes = 120 * 1024 } = {}) {
  if (!file || typeof file.type !== "string" || !file.type.startsWith("image/")) {
    throw codedError("NOT_IMAGE", "El archivo no es una imagen.");
  }

  const url = URL.createObjectURL(file);
  let image;
  try {
    image = await loadImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }

  const first = encodeWithinBudget(image, maxSide, maxBytes);
  if (first) return first;

  const fallback = encodeWithinBudget(image, Math.min(MAX_SIDE_FALLBACK, maxSide), maxBytes);
  if (fallback) return fallback;

  throw codedError("TOO_BIG", "La imagen sigue siendo muy grande.");
}

export default compressImageToDataUrl;

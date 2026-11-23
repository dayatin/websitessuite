/**
 * Non-Destructive Browser-Based Image Processing Pipeline
 * Supports client-side resize, format conversion, DPI recalculation, and Target-KB binary compression.
 */

export type ImageFormat = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

export interface ResizeOptions {
  width?: number;
  height?: number;
  maxDimension?: number;
  scalePercent?: number; // e.g. 50 for 50%
  maintainAspectRatio?: boolean;
  fit?: "contain" | "cover" | "fill";
}

export interface CalculatedDimensions {
  targetWidth: number;
  targetHeight: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

export interface CompressionProfile {
  targetKb: number; // e.g. 50 for max 50KB
  format: ImageFormat;
  maxIterations?: number;
  toleranceBytes?: number; // e.g. 1024 (1KB buffer)
}

export interface BinarySearchResult {
  optimalQuality: number;
  finalSizeBytes: number;
  iterations: number;
  needsDownscaling: boolean;
  suggestedScaleDownFactor: number;
}

export const FORMAT_EXTENSIONS: Record<ImageFormat, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * Resolves standard MIME type from file extension or input string.
 */
export function resolveMimeType(filenameOrExt: string): ImageFormat {
  const ext = filenameOrExt.toLowerCase().split(".").pop() || "";
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "avif":
      return "image/avif";
    default:
      return "image/webp";
  }
}

/**
 * Converts physical millimeters to exact pixels at a specified DPI (default 300 DPI for print).
 */
export function mmToPixels(mm: number, dpi = 300): number {
  return Math.round((mm / 25.4) * dpi);
}

/**
 * Converts physical inches to exact pixels at a specified DPI.
 */
export function inchesToPixels(inches: number, dpi = 300): number {
  return Math.round(inches * dpi);
}

/**
 * Converts pixels to millimeters at a specified DPI.
 */
export function pixelsToMm(pixels: number, dpi = 300): number {
  return Math.round((pixels / dpi) * 25.4 * 10) / 10;
}

/**
 * Calculates optimal target dimensions preserving aspect ratio or center-cropping.
 */
export function calculateTargetDimensions(
  origWidth: number,
  origHeight: number,
  options: ResizeOptions,
): CalculatedDimensions {
  if (origWidth <= 0 || origHeight <= 0) {
    throw new Error("Invalid original image dimensions");
  }

  const aspectRatio = origWidth / origHeight;
  let targetWidth = origWidth;
  let targetHeight = origHeight;
  let cropX = 0;
  let cropY = 0;
  let cropWidth = origWidth;
  let cropHeight = origHeight;

  // Percentage scaling
  if (options.scalePercent && options.scalePercent > 0) {
    const factor = options.scalePercent / 100;
    targetWidth = Math.max(1, Math.round(origWidth * factor));
    targetHeight = Math.max(1, Math.round(origHeight * factor));
    return {
      targetWidth,
      targetHeight,
      cropX: 0,
      cropY: 0,
      cropWidth: origWidth,
      cropHeight: origHeight,
    };
  }

  // Max dimension constraint
  if (options.maxDimension && options.maxDimension > 0) {
    if (origWidth > origHeight) {
      targetWidth = options.maxDimension;
      targetHeight = Math.round(options.maxDimension / aspectRatio);
    } else {
      targetHeight = options.maxDimension;
      targetWidth = Math.round(options.maxDimension * aspectRatio);
    }
    return {
      targetWidth,
      targetHeight,
      cropX: 0,
      cropY: 0,
      cropWidth: origWidth,
      cropHeight: origHeight,
    };
  }

  const reqWidth = options.width;
  const reqHeight = options.height;
  const maintainAspect = options.maintainAspectRatio !== false;
  const fit = options.fit || "contain";

  if (reqWidth && !reqHeight) {
    targetWidth = reqWidth;
    targetHeight = maintainAspect ? Math.round(reqWidth / aspectRatio) : origHeight;
  } else if (!reqWidth && reqHeight) {
    targetHeight = reqHeight;
    targetWidth = maintainAspect ? Math.round(reqHeight * aspectRatio) : origWidth;
  } else if (reqWidth && reqHeight) {
    if (!maintainAspect || fit === "fill") {
      targetWidth = reqWidth;
      targetHeight = reqHeight;
    } else if (fit === "contain") {
      const scale = Math.min(reqWidth / origWidth, reqHeight / origHeight);
      targetWidth = Math.max(1, Math.round(origWidth * scale));
      targetHeight = Math.max(1, Math.round(origHeight * scale));
    } else if (fit === "cover") {
      targetWidth = reqWidth;
      targetHeight = reqHeight;
      const targetAspect = reqWidth / reqHeight;

      if (aspectRatio > targetAspect) {
        // Source is wider -> crop sides
        cropHeight = origHeight;
        cropWidth = Math.round(origHeight * targetAspect);
        cropX = Math.round((origWidth - cropWidth) / 2);
        cropY = 0;
      } else {
        // Source is taller -> crop top and bottom
        cropWidth = origWidth;
        cropHeight = Math.round(origWidth / targetAspect);
        cropX = 0;
        cropY = Math.round((origHeight - cropHeight) / 2);
      }
    }
  }

  return {
    targetWidth: Math.max(1, targetWidth),
    targetHeight: Math.max(1, targetHeight),
    cropX,
    cropY,
    cropWidth,
    cropHeight,
  };
}

/**
 * Simulates binary search compression algorithm to achieve exact target KB size.
 * In production browsers, this calls canvas.convertToBlob({ quality }).
 * Here we provide the mathematical binary search controller for deterministic unit testing.
 */
export function binarySearchTargetQuality(
  estimateSizeFn: (quality: number, scale: number) => number,
  targetBytes: number,
  maxIterations = 7,
): BinarySearchResult {
  let low = 0.1;
  let high = 0.98;
  let optimalQuality = low;
  let finalSizeBytes = estimateSizeFn(low, 1.0);
  let iterations = 0;
  let needsDownscaling = false;
  let suggestedScaleDownFactor = 1.0;

  // Check if minimum quality already exceeds target bytes
  if (finalSizeBytes > targetBytes) {
    needsDownscaling = true;
    suggestedScaleDownFactor = Math.sqrt(targetBytes / finalSizeBytes);
    return {
      optimalQuality: low,
      finalSizeBytes,
      iterations: 1,
      needsDownscaling,
      suggestedScaleDownFactor: Math.max(0.2, Math.min(0.95, suggestedScaleDownFactor)),
    };
  }

  while (iterations < maxIterations && low <= high) {
    iterations++;
    const mid = Number(((low + high) / 2).toFixed(3));
    const currentSize = estimateSizeFn(mid, 1.0);

    if (currentSize <= targetBytes) {
      optimalQuality = mid;
      finalSizeBytes = currentSize;
      // Try higher quality to get closer to the upper bound
      low = mid + 0.02;
    } else {
      // Too large, reduce quality
      high = mid - 0.02;
    }
  }

  return {
    optimalQuality,
    finalSizeBytes,
    iterations,
    needsDownscaling,
    suggestedScaleDownFactor,
  };
}

/**
 * Returns inline WebWorker script source for zero-thread-blocking client processing.
 */
export function getWebWorkerScript(): string {
  return `
self.onmessage = async (e) => {
  const { id, imageBitmap, options, targetKb, format } = e.data;
  try {
    const { targetWidth, targetHeight, cropX, cropY, cropWidth, cropHeight } = options;
    const canvas = new OffscreenCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext("2d", { alpha: format !== "image/jpeg" });
    
    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }
    
    ctx.drawImage(imageBitmap, cropX, cropY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);
    
    let blob;
    if (targetKb && targetKb > 0) {
      const targetBytes = targetKb * 1024;
      let low = 0.1, high = 0.95, bestBlob = null;
      for (let i = 0; i < 7; i++) {
        const q = (low + high) / 2;
        const b = await canvas.convertToBlob({ type: format, quality: q });
        if (b.size <= targetBytes) {
          bestBlob = b;
          low = q + 0.02;
        } else {
          high = q - 0.02;
        }
      }
      blob = bestBlob || (await canvas.convertToBlob({ type: format, quality: 0.1 }));
    } else {
      blob = await canvas.convertToBlob({ type: format, quality: options.quality || 0.85 });
    }
    
    self.postMessage({ id, success: true, blob, width: targetWidth, height: targetHeight, size: blob.size });
  } catch (err) {
    self.postMessage({ id, success: false, error: err.message });
  }
};
  `.trim();
}

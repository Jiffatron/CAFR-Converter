// Client-side OCR utilities
// Note: Main OCR processing happens on the server using tesseract.js

export interface OCRResult {
  text: string;
  confidence: number;
}

export function estimateOCRTime(fileSize: number): number {
  // Rough estimation: 1MB = 30 seconds processing time
  const basetime = 30; // seconds per MB
  const sizeInMB = fileSize / (1024 * 1024);
  return Math.ceil(sizeInMB * basetime);
}

export function formatOCRProgress(progress: number): string {
  if (progress < 0.1) return "Initializing OCR...";
  if (progress < 0.3) return "Loading language data...";
  if (progress < 0.5) return "Preprocessing image...";
  if (progress < 0.8) return "Recognizing text...";
  if (progress < 1.0) return "Finalizing results...";
  return "OCR complete";
}

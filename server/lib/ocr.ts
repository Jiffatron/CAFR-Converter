// OCR processing utilities using Tesseract.js
import { createWorker } from "tesseract.js";

export interface OCRResult {
  text: string;
  confidence: number;
  processingTime: number;
}

export async function performOCR(filePath: string): Promise<OCRResult> {
  const startTime = Date.now();
  
  try {
    // Create worker with English language
    const worker = await createWorker('eng');
    
    const { data: { text, confidence } } = await worker.recognize(filePath);
    
    await worker.terminate();
    
    const processingTime = Date.now() - startTime;
    
    return {
      text: text.trim(),
      confidence: confidence / 100, // Convert to 0-1 range
      processingTime
    };
  } catch (error) {
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function isOCRNeeded(pdfText: string): boolean {
  // If PDF text extraction resulted in very little text, OCR might be needed
  const wordCount = pdfText.trim().split(/\s+/).length;
  const hasValidContent = /[a-zA-Z]{3,}/.test(pdfText); // Contains words with 3+ letters
  
  return wordCount < 50 || !hasValidContent;
}

export function enhanceOCRText(ocrText: string): string {
  // Common OCR corrections for financial documents
  return ocrText
    .replace(/[|]/g, 'l') // Pipe to lowercase L
    .replace(/[0O]/g, '0') // Fix O/0 confusion in numbers
    .replace(/\$\s+/g, '$') // Fix spaced dollar signs
    .replace(/,\s+(\d)/g, ',$1') // Fix spaced commas in numbers
    .replace(/(\d)\s+\./g, '$1.') // Fix spaced decimals
    .trim();
}
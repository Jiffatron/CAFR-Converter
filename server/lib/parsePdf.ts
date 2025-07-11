// PDF parsing utilities for CAFR documents
import fs from "fs";

export interface PDFParseResult {
  text: string;
  pages: number;
  info?: any;
}

export async function parsePdfToText(filePath: string): Promise<PDFParseResult> {
  try {
    // Dynamic import to handle CommonJS module
    const PDFParse = (await import("pdf-parse")).default;
    const dataBuffer = fs.readFileSync(filePath);
    const data = await PDFParse(dataBuffer);
    
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info
    };
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function cleanPdfText(text: string): string {
  // Remove excessive whitespace and normalize line breaks
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

export function extractFinancialSections(text: string): string[] {
  // Common CAFR section headers to look for
  const sectionKeywords = [
    'statement of net position',
    'statement of activities',
    'balance sheet',
    'statement of revenues',
    'statement of expenditures',
    'fund financial statements',
    'governmental funds',
    'proprietary funds',
    'fiduciary funds'
  ];
  
  const sections: string[] = [];
  const textLower = text.toLowerCase();
  
  sectionKeywords.forEach(keyword => {
    const index = textLower.indexOf(keyword);
    if (index !== -1) {
      // Extract section (approximate 2000 characters)
      const section = text.substring(index, index + 2000);
      sections.push(section);
    }
  });
  
  return sections;
}
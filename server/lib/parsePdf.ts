export async function parsePdf(buff: Buffer) {
  try {
    // Dynamic import to handle CommonJS module
    const PDFParse = (await import("pdf-parse")).default;
    const data = await PDFParse(buff);
    return { text: data.text.slice(0, 12000), pages: data.numpages };
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
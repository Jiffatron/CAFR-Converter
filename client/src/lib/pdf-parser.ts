// Client-side PDF parsing utility
// Note: Main PDF processing happens on the server

export async function validatePDFFile(file: File): Promise<boolean> {
  // Basic validation
  if (file.type !== "application/pdf") {
    return false;
  }

  // Check file size (50MB limit)
  if (file.size > 50 * 1024 * 1024) {
    return false;
  }

  // Check if file starts with PDF signature
  const buffer = await file.slice(0, 4).arrayBuffer();
  const signature = new TextDecoder().decode(buffer);
  return signature === "%PDF";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

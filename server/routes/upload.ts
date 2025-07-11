import { Router } from "express";
import multer from "multer";
import fs from "fs/promises";
import { v4 as uuid } from "uuid";
import { parsePdf } from "../lib/parsePdf.js";
import { performOCR } from "../lib/ocr.js";
import { extractMunicipalData } from "../lib/extractMuni.js";
import { toCsv } from "../lib/toCsv.js";
import { createClient } from "@supabase/supabase-js";

const router = Router();

// Create Supabase client (optional for development)
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // 1. Validate that a file exists
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    // TODO: verify paid tier via Stripe before processing
    // For now, we'll process without verification since payment is handled client-side

    // 2. Run parsePdf; if extracted text < 1000 chars then run ocr
    const fileBuffer = await fs.readFile(req.file.path);
    const pdfResult = await parsePdf(fileBuffer);
    
    let extractedText = pdfResult.text;
    if (extractedText.length < 1000) {
      console.log('PDF text too short, running OCR...');
      const ocrResult = await performOCR(req.file.path);
      extractedText = ocrResult.text;
    }

    // 3. Run extractMuni → gets { summary, rows }
    const extractionResult = await extractMunicipalData(extractedText);

    // 4. Convert rows to CSV with toCsv
    const csvContent = toCsv(extractionResult.rows);

    // 5. Write that CSV to a temp file
    const tempCsvPath = `/tmp/${uuid()}.csv`;
    await fs.writeFile(tempCsvPath, csvContent);

    // 6. Upload to Supabase bucket "csv", path exports/${Date.now()}.csv
    let publicUrl = '';
    
    if (supabase) {
      const csvBuffer = await fs.readFile(tempCsvPath);
      const uploadPath = `exports/${Date.now()}.csv`;
      
      const { data, error } = await supabase.storage
        .from('csv')
        .upload(uploadPath, csvBuffer, {
          contentType: 'text/csv',
          upsert: true
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({ success: false, error: 'Failed to upload CSV to storage' });
      }

      // 7. Get the public URL
      const { data: { publicUrl: url } } = supabase.storage
        .from('csv')
        .getPublicUrl(data!.path!);
      
      publicUrl = url;
    } else {
      // For development without Supabase, save locally
      const localPath = `uploads/csv_${Date.now()}.csv`;
      await fs.copyFile(tempCsvPath, localPath);
      publicUrl = `http://localhost:5000/uploads/${localPath.split('/').pop()}`;
      console.log('Supabase not configured, saved CSV locally:', localPath);
    }

    // Clean up temporary files
    await fs.unlink(req.file.path);
    await fs.unlink(tempCsvPath);

    // 8. Respond with success
    res.json({
      success: true,
      summary: extractionResult.summary,
      csvUrl: publicUrl
    });

  } catch (error) {
    console.error('Upload processing error:', error);
    
    // Clean up file if it exists
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;
import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertDocumentSchema, insertProcessingStepSchema } from "@shared/schema";
import { z } from "zod";
import { createWorker } from "tesseract.js";
import OpenAI from "openai";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key",
});

// Import utility functions from lib
import { parsePdf } from "./lib/parsePdf.js";
import { performOCR as performOCRLib } from "./lib/ocr.js";
import { extractMunicipalData as extractMunicipalDataLib } from "./lib/extractMuni.js";
import { toCsv } from "./lib/toCsv.js";

async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const result = await parsePdf(dataBuffer);
  return result.text;
}

async function performOCR(filePath: string): Promise<string> {
  const result = await performOCRLib(filePath);
  return result.text;
}

async function extractMunicipalData(text: string): Promise<any> {
  return await extractMunicipalDataLib(text);
}

function convertToCSV(extractedResult: any): string {
  return toCsv(extractedResult.rows);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get documents for user
  app.get("/api/documents", async (req, res) => {
    try {
      // TODO: Get user ID from authentication
      const userId = 1; // Mock user ID for now
      const documents = await storage.getDocumentsByUserId(userId);
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching documents: " + error.message });
    }
  });

  // Get document by ID
  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching document: " + error.message });
    }
  });

  // Get processing steps for document
  app.get("/api/documents/:id/steps", async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const steps = await storage.getProcessingStepsByDocumentId(documentId);
      res.json(steps);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching processing steps: " + error.message });
    }
  });

  // Upload and process document
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // TODO: Get user ID from authentication
      const userId = 1; // Mock user ID for now

      // Create document record
      const document = await storage.createDocument({
        userId,
        filename: req.file.originalname,
        originalSize: req.file.size,
        status: "processing",
        errorMessage: null,
        extractedData: null,
        recordCount: null,
        csvPath: null,
      });

      // Create initial processing steps
      const steps = [
        { documentId: document.id, stepName: "upload", status: "completed" },
        { documentId: document.id, stepName: "pdf_parse", status: "pending" },
        { documentId: document.id, stepName: "ocr", status: "pending" },
        { documentId: document.id, stepName: "ai_extract", status: "pending" },
        { documentId: document.id, stepName: "csv_generate", status: "pending" },
      ];

      for (const step of steps) {
        await storage.createProcessingStep(step);
      }

      // Start processing asynchronously
      processDocument(document.id, req.file.path).catch(console.error);

      res.json(document);
    } catch (error: any) {
      res.status(500).json({ message: "Error uploading file: " + error.message });
    }
  });

  // Download CSV
  app.get("/api/documents/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document || !document.csvPath) {
        return res.status(404).json({ message: "CSV file not found" });
      }

      if (!fs.existsSync(document.csvPath)) {
        return res.status(404).json({ message: "CSV file not found on disk" });
      }

      res.download(document.csvPath, `${document.filename.replace('.pdf', '')}.csv`);
    } catch (error: any) {
      res.status(500).json({ message: "Error downloading file: " + error.message });
    }
  });

  // Delete document
  app.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Delete CSV file if exists
      if (document.csvPath && fs.existsSync(document.csvPath)) {
        fs.unlinkSync(document.csvPath);
      }

      await storage.deleteDocument(id);
      res.json({ message: "Document deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error deleting document: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function processDocument(documentId: number, filePath: string) {
  try {
    const steps = await storage.getProcessingStepsByDocumentId(documentId);
    
    // Update PDF parsing step
    const pdfParseStep = steps.find(s => s.stepName === "pdf_parse");
    if (pdfParseStep) {
      await storage.updateProcessingStep(pdfParseStep.id, {
        status: "processing",
        startedAt: new Date(),
      });
    }

    let extractedText = "";
    
    try {
      // Try PDF parsing first
      extractedText = await extractTextFromPDF(filePath);
      
      if (pdfParseStep) {
        await storage.updateProcessingStep(pdfParseStep.id, {
          status: "completed",
          completedAt: new Date(),
        });
      }
    } catch (error) {
      console.error("PDF parsing failed:", error);
      
      if (pdfParseStep) {
        await storage.updateProcessingStep(pdfParseStep.id, {
          status: "error",
          completedAt: new Date(),
          errorMessage: "PDF parsing failed",
        });
      }

      // Try OCR fallback
      const ocrStep = steps.find(s => s.stepName === "ocr");
      if (ocrStep) {
        await storage.updateProcessingStep(ocrStep.id, {
          status: "processing",
          startedAt: new Date(),
        });

        try {
          extractedText = await performOCR(filePath);
          await storage.updateProcessingStep(ocrStep.id, {
            status: "completed",
            completedAt: new Date(),
          });
        } catch (ocrError) {
          await storage.updateProcessingStep(ocrStep.id, {
            status: "error",
            completedAt: new Date(),
            errorMessage: "OCR failed",
          });
          throw ocrError;
        }
      }
    }

    if (!extractedText.trim()) {
      throw new Error("No text could be extracted from the document");
    }

    // AI extraction
    const aiStep = steps.find(s => s.stepName === "ai_extract");
    if (aiStep) {
      await storage.updateProcessingStep(aiStep.id, {
        status: "processing",
        startedAt: new Date(),
      });
    }

    const extractionResult = await extractMunicipalData(extractedText);
    
    if (aiStep) {
      await storage.updateProcessingStep(aiStep.id, {
        status: "completed",
        completedAt: new Date(),
      });
    }

    // CSV generation
    const csvStep = steps.find(s => s.stepName === "csv_generate");
    if (csvStep) {
      await storage.updateProcessingStep(csvStep.id, {
        status: "processing",
        startedAt: new Date(),
      });
    }

    const csvContent = convertToCSV(extractionResult);
    const csvPath = `uploads/${documentId}_output.csv`;
    fs.writeFileSync(csvPath, csvContent);

    // Count records from the rows array
    const recordCount = extractionResult.rows.length;

    if (csvStep) {
      await storage.updateProcessingStep(csvStep.id, {
        status: "completed",
        completedAt: new Date(),
      });
    }

    // Update document
    await storage.updateDocument(documentId, {
      status: "completed",
      completedAt: new Date(),
      extractedData: extractionResult.summary,
      recordCount,
      csvPath,
    });

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

  } catch (error: any) {
    console.error("Document processing failed:", error);
    
    await storage.updateDocument(documentId, {
      status: "error",
      completedAt: new Date(),
      errorMessage: error.message,
    });

    // Clean up uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  // TODO: Add Supabase/Stripe fields
  // stripeCustomerId: text("stripe_customer_id"),
  // stripeSubscriptionId: text("stripe_subscription_id"),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filename: text("filename").notNull(),
  originalSize: integer("original_size").notNull(),
  status: text("status").notNull(), // 'uploading' | 'processing' | 'completed' | 'error'
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  extractedData: jsonb("extracted_data"),
  recordCount: integer("record_count"),
  csvPath: text("csv_path"),
});

export const processingSteps = pgTable("processing_steps", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  stepName: text("step_name").notNull(), // 'upload' | 'pdf_parse' | 'ocr' | 'ai_extract' | 'csv_generate'
  status: text("status").notNull(), // 'pending' | 'processing' | 'completed' | 'error'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
  completedAt: true,
});

export const insertProcessingStepSchema = createInsertSchema(processingSteps).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertProcessingStep = z.infer<typeof insertProcessingStepSchema>;
export type ProcessingStep = typeof processingSteps.$inferSelect;

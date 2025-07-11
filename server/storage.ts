import { users, documents, processingSteps, type User, type InsertUser, type Document, type InsertDocument, type ProcessingStep, type InsertProcessingStep } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Document methods
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;

  // Processing step methods
  getProcessingStepsByDocumentId(documentId: number): Promise<ProcessingStep[]>;
  createProcessingStep(step: InsertProcessingStep): Promise<ProcessingStep>;
  updateProcessingStep(id: number, updates: Partial<ProcessingStep>): Promise<ProcessingStep | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private documents: Map<number, Document>;
  private processingSteps: Map<number, ProcessingStep>;
  private currentUserId: number;
  private currentDocumentId: number;
  private currentStepId: number;

  constructor() {
    this.users = new Map();
    this.documents = new Map();
    this.processingSteps = new Map();
    this.currentUserId = 1;
    this.currentDocumentId = 1;
    this.currentStepId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId,
    );
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.currentDocumentId++;
    const document: Document = {
      ...insertDocument,
      id,
      uploadedAt: new Date(),
      completedAt: null,
      errorMessage: insertDocument.errorMessage || null,
      extractedData: insertDocument.extractedData || null,
      recordCount: insertDocument.recordCount || null,
      csvPath: insertDocument.csvPath || null,
    };
    this.documents.set(id, document);
    return document;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document | undefined> {
    const document = this.documents.get(id);
    if (!document) return undefined;
    
    const updatedDocument = { ...document, ...updates };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }

  async getProcessingStepsByDocumentId(documentId: number): Promise<ProcessingStep[]> {
    return Array.from(this.processingSteps.values()).filter(
      (step) => step.documentId === documentId,
    );
  }

  async createProcessingStep(insertStep: InsertProcessingStep): Promise<ProcessingStep> {
    const id = this.currentStepId++;
    const step: ProcessingStep = {
      ...insertStep,
      id,
      startedAt: null,
      completedAt: null,
      errorMessage: insertStep.errorMessage || null,
    };
    this.processingSteps.set(id, step);
    return step;
  }

  async updateProcessingStep(id: number, updates: Partial<ProcessingStep>): Promise<ProcessingStep | undefined> {
    const step = this.processingSteps.get(id);
    if (!step) return undefined;
    
    const updatedStep = { ...step, ...updates };
    this.processingSteps.set(id, updatedStep);
    return updatedStep;
  }
}

export const storage = new MemStorage();

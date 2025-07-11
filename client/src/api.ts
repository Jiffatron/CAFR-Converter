// Simple API client for CAFR processing
const API_BASE = 'http://localhost:5000';

export interface Document {
  id: number;
  filename: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  uploadedAt: string;
  completedAt?: string;
  errorMessage?: string;
  recordCount?: number;
}

export interface ProcessingStep {
  id: number;
  documentId: number;
  stepName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export class ApiClient {
  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async getDocuments(): Promise<Document[]> {
    const response = await fetch(`${API_BASE}/api/documents`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    return response.json();
  }

  async getDocument(id: number): Promise<Document> {
    const response = await fetch(`${API_BASE}/api/documents/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch document');
    }

    return response.json();
  }

  async getProcessingSteps(documentId: number): Promise<ProcessingStep[]> {
    const response = await fetch(`${API_BASE}/api/documents/${documentId}/steps`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch processing steps');
    }

    return response.json();
  }

  async downloadCSV(documentId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE}/api/documents/${documentId}/download`);
    
    if (!response.ok) {
      throw new Error('Failed to download CSV');
    }

    return response.blob();
  }

  async deleteDocument(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/api/documents/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Delete failed');
    }
  }
}

export const apiClient = new ApiClient();

// TODO: Add Supabase integration
export class SupabaseClient {
  constructor() {
    console.warn('Supabase integration not yet implemented');
  }
  
  // TODO: Implement authentication
  async signIn(email: string, password: string) {
    throw new Error('Supabase auth not implemented yet');
  }
  
  // TODO: Implement file storage
  async uploadFile(file: File) {
    throw new Error('Supabase storage not implemented yet');
  }
}

// TODO: Add Stripe integration
export class StripeClient {
  constructor() {
    console.warn('Stripe integration not yet implemented');
  }
  
  // TODO: Implement payment processing
  async createPaymentIntent(amount: number) {
    throw new Error('Stripe payments not implemented yet');
  }
}
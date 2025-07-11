import { useCallback, useState } from "react";
import { FiUpload, FiFile, FiX } from "react-icons/fi";
import { apiClient, type Document } from "../api";

interface FileDropProps {
  onDocumentUploaded: (result: { success: boolean, summary: any, csvUrl: string }) => void;
}

export default function FileDrop({ onDocumentUploaded }: FileDropProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await apiClient.uploadDocument(file);
      setUploadProgress(100);
      onDocumentUploaded(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onDocumentUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className="w-full">
      <div className="card bg-base-100 shadow-xl rounded-2xl transition-transform hover:scale-105">
        <div
          className={`
            border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer relative
            ${isDragOver 
              ? 'border-secondary bg-accent' 
              : 'border-accent hover:border-secondary'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {/* Upload overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-2xl">
              <div className="text-center">
                <div className="loading loading-spinner loading-lg text-primary"></div>
                <p className="mt-2 text-sm font-medium">Processing...</p>
              </div>
            </div>
          )}
          
          <input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
            disabled={isUploading}
          />
          
          <FiUpload className="mx-auto h-12 w-12 text-slate-600 mb-4" />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-slate-600">
              {isDragOver ? 'Drop your PDF here' : 'Upload CAFR Document'}
            </h3>
            <p className="text-slate-600">
              Drag and drop your PDF file, or click to browse
            </p>
            <p className="text-sm text-slate-600">
              Supports PDF files up to 50MB
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mt-4">
          <FiX className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
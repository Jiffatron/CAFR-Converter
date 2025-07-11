import { useState, useEffect } from "react";
import { FiCheck, FiClock, FiAlertCircle, FiLoader } from "react-icons/fi";
import { apiClient, type Document, type ProcessingStep } from "../api";

interface ProcessingStatusProps {
  document: Document;
}

const stepLabels = {
  upload: "File Upload",
  pdf_parse: "PDF Text Extraction", 
  ocr: "OCR Processing",
  ai_extract: "AI Data Extraction",
  csv_generate: "CSV Generation"
};

const stepDescriptions = {
  upload: "File uploaded successfully",
  pdf_parse: "Extracting text from PDF document",
  ocr: "Processing scanned pages with OCR",
  ai_extract: "Identifying financial data with AI",
  csv_generate: "Converting to CSV format"
};

export default function ProcessingStatus({ document }: ProcessingStatusProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const stepData = await apiClient.getProcessingSteps(document.id);
        setSteps(stepData);
      } catch (error) {
        console.error('Failed to fetch processing steps:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSteps();

    // Poll for updates every 2 seconds if document is still processing
    let interval: NodeJS.Timeout | null = null;
    if (document.status === 'processing' || document.status === 'uploading') {
      interval = setInterval(fetchSteps, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [document.id, document.status]);

  const getStepStatus = (stepName: string) => {
    const step = steps.find(s => s.stepName === stepName);
    return step?.status || 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheck className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <FiLoader className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <FiAlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FiLoader className="h-6 w-6 animate-spin text-blue-600 mr-2" />
        <span>Loading processing status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(stepLabels).map(([stepName, label]) => {
        const status = getStepStatus(stepName);
        return (
          <div
            key={stepName}
            className={`flex items-center space-x-3 p-3 border rounded-lg ${getStatusColor(status)}`}
          >
            <div className="flex-shrink-0">
              {getStatusIcon(status)}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{label}</h3>
              <p className="text-sm text-gray-600">
                {stepDescriptions[stepName as keyof typeof stepDescriptions]}
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className={`
                px-2 py-1 text-xs rounded-full
                ${status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                ${status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                ${status === 'error' ? 'bg-red-100 text-red-800' : ''}
                ${status === 'pending' ? 'bg-gray-100 text-gray-600' : ''}
              `}>
                {status}
              </span>
            </div>
          </div>
        );
      })}

      {/* Error Details */}
      {document.status === 'error' && (
        <div className="alert alert-error">
          <FiAlertCircle className="h-5 w-5" />
          <div>
            <h3 className="font-medium">Processing Failed</h3>
            <p className="text-sm mt-1">
              {document.errorMessage || 'An error occurred during processing'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
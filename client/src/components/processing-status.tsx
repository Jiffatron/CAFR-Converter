import { useQuery } from "@tanstack/react-query";
import { CheckCircle, AlertCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessingStatusProps {
  documentId: number;
}

const stepIcons = {
  upload: CheckCircle,
  pdf_parse: CheckCircle,
  ocr: Clock,
  ai_extract: Clock,
  csv_generate: Clock,
};

const stepLabels = {
  upload: "File Upload Complete",
  pdf_parse: "Processing PDF",
  ocr: "OCR Processing",
  ai_extract: "AI Data Extraction",
  csv_generate: "CSV Generation",
};

const stepDescriptions = {
  upload: "File uploaded successfully",
  pdf_parse: "Extracting text content...",
  ocr: "Waiting for PDF parsing...",
  ai_extract: "Identifying financial data...",
  csv_generate: "Converting to CSV format...",
};

export default function ProcessingStatus({ documentId }: ProcessingStatusProps) {
  const { data: document } = useQuery({
    queryKey: ["/api/documents", documentId],
    refetchInterval: 2000, // Poll every 2 seconds during processing
  });

  const { data: steps = [] } = useQuery({
    queryKey: ["/api/documents", documentId, "steps"],
    refetchInterval: 2000,
  });

  const getStepStatus = (stepName: string) => {
    const step = steps.find((s: any) => s.stepName === stepName);
    return step?.status || "pending";
  };

  const getStepClassName = (status: string) => {
    switch (status) {
      case "completed":
        return "success border-green-200";
      case "processing":
        return "bg-blue-50 border-blue-200";
      case "error":
        return "error border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStepIcon = (stepName: string, status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "processing":
        return Loader2;
      case "error":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getStepIconClassName = (status: string) => {
    switch (status) {
      case "completed":
        return "w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white";
      case "processing":
        return "w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white animate-spin";
      case "error":
        return "w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white";
      default:
        return "w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white";
    }
  };

  const getStepTextClassName = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-700";
      case "processing":
        return "text-blue-700";
      case "error":
        return "text-red-700";
      default:
        return "text-gray-600";
    }
  };

  const getStepDescriptionClassName = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "processing":
        return "text-blue-600";
      case "error":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      {Object.keys(stepLabels).map((stepName) => {
        const status = getStepStatus(stepName);
        const IconComponent = getStepIcon(stepName, status);
        
        return (
          <div
            key={stepName}
            className={`flex items-center space-x-3 p-3 rounded-lg border ${getStepClassName(status)}`}
          >
            <div className={getStepIconClassName(status)}>
              <IconComponent className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${getStepTextClassName(status)}`}>
                {stepLabels[stepName as keyof typeof stepLabels]}
              </p>
              <p className={`text-sm ${getStepDescriptionClassName(status)}`}>
                {status === "processing" && stepName === "pdf_parse" 
                  ? "Extracting text content..."
                  : status === "processing" && stepName === "ocr"
                  ? "Processing scanned content..."
                  : status === "processing" && stepName === "ai_extract"
                  ? "Analyzing financial data..."
                  : status === "processing" && stepName === "csv_generate"
                  ? "Generating CSV file..."
                  : stepDescriptions[stepName as keyof typeof stepDescriptions]
                }
              </p>
            </div>
          </div>
        );
      })}

      {document?.status === "error" && (
        <div className="mt-6 p-4 error border rounded-lg">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Processing Error</h3>
              <p className="text-sm text-red-700 mt-1">
                {document.errorMessage || "An error occurred during processing."}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-red-600 border-red-600 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

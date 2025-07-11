import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Download, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ResultsSectionProps {
  documentId: number;
}

export default function ResultsSection({ documentId }: ResultsSectionProps) {
  const { toast } = useToast();
  
  const { data: document } = useQuery({
    queryKey: ["/api/documents", documentId],
    refetchInterval: 2000,
  });

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`);
      if (!response.ok) {
        throw new Error("Download failed");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${document?.filename?.replace('.pdf', '') || 'cafr_data'}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your CSV file is downloading.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the CSV file.",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    // TODO: Implement data preview modal
    toast({
      title: "Preview",
      description: "Data preview functionality coming soon.",
    });
  };

  if (!document) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
        <p className="text-gray-500">Upload a CAFR document to begin processing.</p>
      </div>
    );
  }

  if (document.status === "processing" || document.status === "uploading") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Document</h3>
        <p className="text-gray-600">Please wait while we extract your financial data...</p>
      </div>
    );
  }

  if (document.status === "error") {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Failed</h3>
        <p className="text-gray-600 mb-4">
          {document.errorMessage || "An error occurred while processing your document."}
        </p>
        <Button variant="outline">Try Again</Button>
      </div>
    );
  }

  if (document.status === "completed") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Complete!</h3>
        <p className="text-gray-600 mb-6">Successfully extracted financial data from your CAFR document.</p>
        
        {/* Data Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Records Extracted</p>
            <p className="text-2xl font-semibold text-gray-900">
              {document.recordCount || 0}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Original File Size</p>
            <p className="text-2xl font-semibold text-gray-900">
              {document.originalSize ? `${Math.round(document.originalSize / 1024)} KB` : "N/A"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Processing Time</p>
            <p className="text-2xl font-semibold text-gray-900">
              {document.completedAt && document.uploadedAt
                ? `${Math.round((new Date(document.completedAt).getTime() - new Date(document.uploadedAt).getTime()) / 1000)}s`
                : "N/A"
              }
            </p>
          </div>
        </div>

        {/* Download Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleDownload} className="inline-flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          <Button variant="outline" onClick={handlePreview} className="inline-flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Preview Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
      <p className="text-gray-500">Upload a CAFR document to begin processing.</p>
    </div>
  );
}

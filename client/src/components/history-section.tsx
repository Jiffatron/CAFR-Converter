import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistorySectionProps {
  onDocumentSelected: (documentId: number) => void;
}

export default function HistorySection({ onDocumentSelected }: HistorySectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["/api/documents"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await apiRequest("DELETE", `/api/documents/${documentId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Deleted",
        description: "The document has been removed from your history.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const handleDownload = async (documentId: number, filename: string) => {
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
      a.download = `${filename.replace('.pdf', '')}.csv`;
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

  const handleDelete = (documentId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(documentId);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Less than an hour ago";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="p-6 text-center">
        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-500">No conversion history yet.</p>
      </div>
    );
  }

  return (
    <>
      {documents.map((document: any) => (
        <div 
          key={document.id} 
          className="p-6 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
          onClick={() => onDocumentSelected(document.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                document.status === "completed" 
                  ? "bg-green-100" 
                  : document.status === "error"
                  ? "bg-red-100"
                  : "bg-blue-100"
              }`}>
                <FileText className={`w-5 h-5 ${
                  document.status === "completed" 
                    ? "text-green-600" 
                    : document.status === "error"
                    ? "text-red-600"
                    : "text-blue-600"
                }`} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{document.filename}</p>
                <p className="text-sm text-gray-500">
                  {document.recordCount 
                    ? `${document.recordCount} records` 
                    : document.status === "error" 
                    ? "Processing failed"
                    : "Processing..."
                  } • {formatTimeAgo(document.uploadedAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              {document.status === "completed" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(document.id, document.filename)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(document.id)}
                className="text-gray-400 hover:text-gray-600"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

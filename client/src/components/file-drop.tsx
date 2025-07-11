import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface FileDropProps {
  onDocumentUploaded: (documentId: number) => void;
}

export default function FileDrop({ onDocumentUploaded }: FileDropProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress for UI feedback
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      try {
        const response = await apiRequest("POST", "/api/upload", formData);
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        const result = await response.json();
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: (document) => {
      toast({
        title: "Upload Successful",
        description: "Your document is now being processed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      onDocumentUploaded(document.id);
      setUploadProgress(0);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-700">
            {isDragActive ? "Drop your PDF file here" : "Drop your PDF file here"}
          </p>
          <p className="text-sm text-gray-500">or click to browse</p>
          <p className="text-xs text-gray-400">Supports PDF files up to 50MB</p>
        </div>
      </div>

      {uploadMutation.isPending && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </div>
  );
}

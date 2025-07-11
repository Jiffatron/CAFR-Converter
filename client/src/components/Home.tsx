import { useState, useCallback } from "react";
import { FiUpload, FiFile, FiDownload, FiTrash2 } from "react-icons/fi";
import FileDrop from "./FileDrop";
import ProcessingStatus from "./ProcessingStatus";
import { apiClient, type Document } from "../api";

export default function Home() {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDocumentUploaded = useCallback((document: Document) => {
    setSelectedDocument(document);
    setDocuments(prev => [document, ...prev]);
  }, []);

  const handleDownload = async (documentId: number, filename: string) => {
    try {
      const blob = await apiClient.downloadCSV(documentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${filename.replace('.pdf', '')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await apiClient.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">
          Transform CAFR Reports to CSV
        </h1>
        <p className="text-slate-600">
          Upload your CAFR PDF documents and extract municipal financial data automatically
        </p>
      </header>

      {/* Upload Section */}
      <div className="card bg-white shadow-md border border-accent mb-8 hover:border-secondary transition-colors">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4 text-primary">
            <FiUpload className="mr-2" />
            Upload CAFR Document
          </h2>
          <FileDrop onDocumentUploaded={handleDocumentUploaded} />
        </div>
      </div>

      {/* Processing Status */}
      {selectedDocument && (
        <div className="card bg-white shadow-md mb-8">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 text-primary">
              <FiFile className="mr-2" />
              Processing Status: {selectedDocument.filename}
            </h2>
            <ProcessingStatus document={selectedDocument} />
          </div>
        </div>
      )}

      {/* Results & Download */}
      {selectedDocument?.status === 'completed' && (
        <div className="card bg-white shadow-md mb-8">
          <div className="card-header bg-primary text-white p-4 rounded-t-lg">
            <h3 className="font-semibold text-lg">Processing Complete!</h3>
          </div>
          <div className="card-body">
            <div className="stats stats-horizontal shadow">
              <div className="stat">
                <div className="stat-title text-accent">Records Extracted</div>
                <div className="stat-value text-primary">{selectedDocument.recordCount || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-title text-accent">Status</div>
                <div className="stat-value text-primary">Ready</div>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                className="btn btn-secondary"
                onClick={() => handleDownload(selectedDocument.id, selectedDocument.filename)}
              >
                <FiDownload className="mr-2" />
                Download CSV
              </button>
              <button className="btn btn-outline">
                Preview Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document History */}
      {documents.length > 0 && (
        <div className="card bg-white shadow-md">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4 text-primary">Recent Conversions</h2>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex items-center space-x-3">
                    <FiFile className="text-blue-500" />
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-sm text-gray-500">
                        {doc.status === 'completed' 
                          ? `${doc.recordCount || 0} records`
                          : doc.status
                        } • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {doc.status === 'completed' && (
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(doc.id, doc.filename);
                        }}
                      >
                        <FiDownload />
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-ghost text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc.id);
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
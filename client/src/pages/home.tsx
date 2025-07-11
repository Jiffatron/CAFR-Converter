import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileDrop from "@/components/file-drop";
import ProcessingStatus from "@/components/processing-status";
import ResultsSection from "@/components/results-section";
import HistorySection from "@/components/history-section";
import { Upload, Settings, Download, History, FileText, User } from "lucide-react";

export default function Home() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-medium text-gray-900">CAFR Processor</h1>
                <p className="text-xs text-gray-500">Convert CAFR documents to CSV</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* TODO: Replace with actual authentication */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>user@example.com</span>
              </div>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Upload Section */}
        <Card className="shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Upload className="w-5 h-5 text-primary mr-2" />
              Upload CAFR Document
            </h2>
            <p className="text-sm text-gray-600 mt-1">Upload your PDF document to extract municipal financial data</p>
          </div>
          <CardContent className="p-6">
            <FileDrop onDocumentUploaded={setSelectedDocumentId} />
          </CardContent>
        </Card>

        {/* Processing Status */}
        {selectedDocumentId && (
          <Card className="shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Settings className="w-5 h-5 text-primary mr-2" />
                Processing Status
              </h2>
            </div>
            <CardContent className="p-6">
              <ProcessingStatus documentId={selectedDocumentId} />
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {selectedDocumentId && (
          <Card className="shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Download className="w-5 h-5 text-primary mr-2" />
                Processing Results
              </h2>
            </div>
            <CardContent className="p-6">
              <ResultsSection documentId={selectedDocumentId} />
            </CardContent>
          </Card>
        )}

        {/* History Section */}
        <Card className="shadow-sm">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <History className="w-5 h-5 text-primary mr-2" />
              Recent Conversions
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            <HistorySection onDocumentSelected={setSelectedDocumentId} />
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <FileText className="w-3 h-3 text-primary-foreground" />
              </div>
              <span className="text-sm text-gray-600">CAFR Processor</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">Privacy</a>
              <a href="#" className="hover:text-gray-700">Terms</a>
              <a href="#" className="hover:text-gray-700">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

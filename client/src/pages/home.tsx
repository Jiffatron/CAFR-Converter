import { useState, useCallback } from "react";
import FileDrop from "../components/FileDrop";
import ProcessingSteps from "../components/ProcessingSteps";
import ResultCard from "../components/ResultCard";
import { FiTrendingUp } from "react-icons/fi";

export default function Home() {
  const [step, setStep] = useState<"upload" | "parse" | "ocr" | "ai" | "csv">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [csvUrl, setCsvUrl] = useState<string>("");

  const handleDocumentUploaded = useCallback(async (result: { success: boolean, summary: any, csvUrl: string }) => {
    if (result.success) {
      setStep("parse");
      setIsProcessing(true);
      
      // Simulate processing steps
      setTimeout(() => setStep("ai"), 500);
      setTimeout(() => {
        setStep("csv");
        setSummary(result.summary);
        setCsvUrl(result.csvUrl);
        setIsProcessing(false);
      }, 1000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-white to-accent">
      {/* Navigation */}
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="flex-1">
          <FiTrendingUp className="h-6 w-6 mr-2" />
          <span className="text-xl font-bold">CAFR Converter</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Turn 200-page CAFRs into clean spreadsheets in under 2 minutes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your CAFR PDF and our AI will extract all financial data into a structured CSV file
          </p>
        </div>

        {/* Processing Steps */}
        <ProcessingSteps currentStep={step} />

        {/* Upload Section */}
        <div className="max-w-2xl mx-auto">
          <FileDrop onDocumentUploaded={handleDocumentUploaded} />
        </div>

        {/* Results Section */}
        {summary && (
          <div className="max-w-2xl mx-auto">
            <ResultCard summary={summary} csvUrl={csvUrl} />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs opacity-60 py-8">
          Powered by GPT-4o • Tesseract.js OCR • Secure Processing
        </footer>
      </div>
    </div>
  );
}
        </div>
      </footer>
    </div>
  );
}

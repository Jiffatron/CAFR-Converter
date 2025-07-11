import { useState, useCallback, useEffect } from "react";
import FileDrop from "../components/FileDrop";
import ProcessingSteps from "../components/ProcessingSteps";
import ResultCard from "../components/ResultCard";
import { FiTrendingUp, FiCreditCard } from "react-icons/fi";
import { payForParse, verifyPayment } from "../api/stripe";

export default function Home() {
  const [step, setStep] = useState<"upload" | "parse" | "ocr" | "ai" | "csv">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [csvUrl, setCsvUrl] = useState<string>("");
  const [paid, setPaid] = useState(false);

  // Check for payment verification on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    
    if (sessionId) {
      verifyPayment(sessionId).then((isPaid) => {
        if (isPaid) {
          setPaid(true);
          // Clean up URL
          window.history.replaceState({}, document.title, "/");
        }
      });
    }
  }, []);

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
        // Reset payment status for next file
        setPaid(false);
      }, 1000);
    }
  }, []);

  const handlePayForParse = useCallback(async () => {
    try {
      await payForParse();
    } catch (error) {
      alert("Payment failed. Please try again.");
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
          {paid ? (
            <FileDrop onDocumentUploaded={handleDocumentUploaded} />
          ) : (
            <div className="card bg-base-100 shadow-xl rounded-2xl p-8 text-center">
              <FiCreditCard className="mx-auto h-16 w-16 text-primary mb-4" />
              <h3 className="text-2xl font-bold text-primary mb-4">
                Professional CAFR Processing
              </h3>
              <p className="text-gray-600 mb-6">
                Get accurate financial data extraction from your CAFR documents using advanced AI and OCR technology.
              </p>
              <button 
                className="btn btn-primary text-lg px-8 py-3"
                onClick={handlePayForParse}
              >
                Unlock Processing – $5
              </button>
              <p className="text-xs text-gray-500 mt-4">
                One-time payment per document • Secure processing with Stripe
              </p>
            </div>
          )}
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

import { FiCheckCircle, FiLoader, FiCircle } from "react-icons/fi";

interface ProcessingStepsProps {
  currentStep: "upload" | "parse" | "ocr" | "ai" | "csv";
}

export default function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
  const steps = [
    { id: "upload", label: "Upload Document" },
    { id: "parse", label: "Parse PDF" },
    { id: "ai", label: "Extract Data" },
    { id: "csv", label: "Generate CSV" }
  ];

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex || currentStep === "csv") {
      return "completed";
    } else if (stepIndex === currentIndex) {
      return "current";
    } else {
      return "pending";
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <FiCheckCircle className="h-5 w-5" />;
      case "current":
        return <FiLoader className="h-5 w-5 animate-spin" />;
      default:
        return <FiCircle className="h-5 w-5" />;
    }
  };

  const getStepClassName = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary text-primary-content";
      case "current":
        return "bg-secondary text-secondary-content animate-pulse";
      default:
        return "bg-neutral text-neutral-content";
    }
  };

  return (
    <div className="card bg-base-100 shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Processing Status</h3>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          return (
            <div key={step.id} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full
                ${getStepClassName(status)}
              `}>
                {getStepIcon(status)}
              </div>
              <div className="ml-4 flex-1">
                <p className="font-medium">{step.label}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute ml-5 mt-10 w-0.5 h-6 bg-neutral opacity-30"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
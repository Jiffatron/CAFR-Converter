import { FiTrendingUp } from "react-icons/fi";
import Home from "./components/Home";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen" data-theme="muniPro">
      {/* Navigation Bar */}
      <div className="navbar bg-primary text-primary-content shadow-lg">
        <div className="navbar-start">
          <div className="flex items-center space-x-2">
            <FiTrendingUp className="h-6 w-6" />
            <span className="text-xl font-bold">CAFR Converter</span>
          </div>
        </div>
        <div className="navbar-end">
          <a className="btn btn-ghost" href="#docs">Docs</a>
          <a className="btn btn-ghost" href="#contact">Contact</a>
        </div>
      </div>

      {/* Main Content */}
      <Home />

      {/* Footer */}
      <footer className="text-xs text-center mt-12 opacity-70">
        Powered by GPT-4o • Tesseract.js OCR • Secure Processing
      </footer>
    </div>
  );
}

export default App;

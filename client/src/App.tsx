import { Router, Route } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/home";
import Cancel from "./pages/cancel";
import NotFound from "./pages/not-found";
import "./index.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen" data-theme="muniPro">
        <Router>
          <Route path="/" component={Home} />
          <Route path="/cancel" component={Cancel} />
          <Route component={NotFound} />
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;

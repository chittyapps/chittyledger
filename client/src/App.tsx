import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/error-boundary";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import EvidenceManagement from "@/pages/evidence-management";
import NotionSync from "@/pages/notion-sync";
import NotFound from "@/pages/not-found";
import Search from "@/pages/search";
import Chain from "@/pages/chain";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/evidence" component={EvidenceManagement} />
      <Route path="/notion" component={NotionSync} />
      <Route path="/search" component={Search} />
      <Route path="/chain" component={Chain} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="bg-slate-900 text-slate-50 font-sans overflow-x-hidden min-h-screen">
            <Navigation />
            <main className="ml-20">
              <ErrorBoundary>
                <Router />
              </ErrorBoundary>
            </main>
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

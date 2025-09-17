import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 text-slate-50 p-8 flex items-center justify-center">
          <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-8 h-8 text-red-500" />
                <div>
                  <CardTitle className="text-red-400">Something went wrong</CardTitle>
                  <CardDescription className="text-slate-400">
                    An unexpected error occurred in the ChittyChain Evidence Ledger
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="bg-red-900/20 border-red-500/50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-red-400">Error Details</AlertTitle>
                <AlertDescription className="text-slate-300 mt-2">
                  {this.state.error?.message || 'An unknown error occurred'}
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Stack Trace (Development)</h4>
                  <pre className="text-xs text-slate-400 overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('Caught error:', error, errorInfo);
    // Could dispatch to global error state or toast
  };
};

// Query Error Boundary for React Query errors
export function QueryErrorBoundary({ children, fallback }: Props) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <Alert className="bg-red-900/20 border-red-500/50 m-4">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-400">Failed to load data</AlertTitle>
            <AlertDescription className="text-slate-300">
              There was an error loading the requested information. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
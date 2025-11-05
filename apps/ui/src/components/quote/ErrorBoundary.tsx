import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class QuoteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Quote component error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="quote-error" role="alert" data-testid="quote-error-boundary">
          <h2 className="quote-error__title">Something went wrong</h2>
          <p className="quote-error__message">
            Unable to load the quote explorer. Please refresh the page or try again later.
          </p>
          <details className="quote-error__details">
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
          <button
            type="button"
            className="quote-error__reload"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default QuoteErrorBoundary;

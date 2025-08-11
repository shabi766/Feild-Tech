import React from 'react';
import { Button } from '../ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo }) => {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        
        <h1 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mb-4 p-3 bg-gray-100 rounded text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <pre className="text-xs text-red-600 overflow-auto">
              {error && error.toString()}
              {errorInfo && errorInfo.componentStack}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRefresh}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
          
          <Button
            onClick={handleGoHome}
            variant="outline"
            className="flex-1"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;


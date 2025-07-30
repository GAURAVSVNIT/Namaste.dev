import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} resetError={() => this.setState({ hasError: false, error: null })} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
    resetError();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
          <p className="text-sm opacity-90">
            We're having trouble loading this page. Please try again or contact support if the problem persists.
          </p>
        </div>
        
        <div className="p-6">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-700 font-medium">
              {error?.message || 'An unexpected error occurred'}
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button 
              onClick={handleRefresh}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            
            <Button 
              onClick={handleGoHome}
              variant="outline"
              className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </Button>
          </div>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => console.error(error)}
              className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
            >
              View technical details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;

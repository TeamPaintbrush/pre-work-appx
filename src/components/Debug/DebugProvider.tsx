/**
 * Debug Provider Component
 * Provides debugging context and error boundaries for the entire app
 */

"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import DebugConsole from './DebugConsole';

interface DebugContextType {
  isDebugMode: boolean;
  toggleDebugMode: () => void;
  logEvent: (event: string, data?: any) => void;
  reportError: (error: Error, context?: string) => void;
  reportWarning: (message: string, context?: string) => void;
  addMetric: (name: string, value: number) => void;
}

const DebugContext = createContext<DebugContextType | null>(null);

interface DebugProviderProps {
  children: ReactNode;
  enableInProduction?: boolean;
  showConsoleByDefault?: boolean;
}

interface ErrorInfo {
  componentStack: string;
}

class ErrorBoundary extends React.Component<
  { children: ReactNode; onError: (error: Error, errorInfo: ErrorInfo) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Enhanced error logging with more context
    console.error('💥 React Error Boundary Caught:', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      errorInfo,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
    });
    
    this.props.onError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Application Error</h1>
                <p className="text-gray-600">Something went wrong. The debug console has captured the details.</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Error Details</h3>
              <p className="text-sm text-red-600 font-mono">{this.state.error?.message}</p>
              {this.state.error?.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600">Stack Trace</summary>
                  <pre className="mt-2 text-xs text-gray-500 whitespace-pre-wrap overflow-auto max-h-40">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const DebugProvider: React.FC<DebugProviderProps> = ({
  children,
  enableInProduction = false,
  showConsoleByDefault = false
}) => {
  const [isDebugMode, setIsDebugMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const hasDebugParam = window.location.search.includes('debug=true');
    
    return (isDevelopment || isLocalhost || hasDebugParam || enableInProduction) || showConsoleByDefault;
  });

  const [metrics, setMetrics] = useState<Record<string, number>>({});

  // Monitor unhandled errors
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleError = (event: ErrorEvent) => {
      console.error('🚨 Unhandled Error:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('🚨 Unhandled Promise Rejection:', event.reason);
    };

    // Monitor navigation performance
    const handleLoad = () => {
      setTimeout(() => {
        if (window.performance) {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            console.info('📊 Page Load Metrics:', {
              'DOM Content Loaded': Math.round(navigation.domContentLoadedEventEnd - navigation.startTime),
              'Page Load Complete': Math.round(navigation.loadEventEnd - navigation.startTime),
              'DNS Lookup': Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
              'TCP Connection': Math.round(navigation.connectEnd - navigation.connectStart),
              'Server Response': Math.round(navigation.responseEnd - navigation.requestStart),
              'DOM Processing': Math.round(navigation.domComplete - navigation.responseEnd)
            });
          }
        }
      }, 0);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('load', handleLoad);

    // Monitor long tasks (performance)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) { // Long task threshold
              console.warn('⚠️ Long Task Detected:', {
                duration: `${Math.round(entry.duration)}ms`,
                startTime: Math.round(entry.startTime),
                name: entry.name
              });
            }
          });
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        
        return () => {
          observer.disconnect();
        };
      } catch (e) {
        // PerformanceObserver not supported
      }
    }

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  // Keyboard shortcut to toggle debug mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl + Shift + D to toggle debug mode
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setIsDebugMode(prev => {
          const newMode = !prev;
          console.info(`🔧 Debug Mode ${newMode ? 'Enabled' : 'Disabled'}`);
          return newMode;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const contextValue: DebugContextType = {
    isDebugMode,
    toggleDebugMode: () => setIsDebugMode(prev => !prev),
    logEvent: (event: string, data?: any) => {
      if (isDebugMode) {
        console.log(`📝 Event: ${event}`, data || '');
      }
    },
    reportError: (error: Error, context?: string) => {
      console.error(`❌ Error${context ? ` in ${context}` : ''}:`, error);
    },
    reportWarning: (message: string, context?: string) => {
      console.warn(`⚠️ Warning${context ? ` in ${context}` : ''}:`, message);
    },
    addMetric: (name: string, value: number) => {
      setMetrics(prev => ({ ...prev, [name]: value }));
      if (isDebugMode) {
        console.info(`📊 Metric: ${name} = ${value}`);
      }
    }
  };

  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('💥 React Error Boundary Caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  };

  return (
    <DebugContext.Provider value={contextValue}>
      <ErrorBoundary onError={handleError}>
        {children}
        {isDebugMode && (
          <DebugConsole
            maxEntries={100}
            autoScroll={true}
            showTimestamps={true}
            enablePerformanceMonitoring={true}
            enableNetworkMonitoring={true}
            position="bottom-right"
          />
        )}
      </ErrorBoundary>
    </DebugContext.Provider>
  );
};

// Hook to use debug context
export const useDebug = () => {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
};

export default DebugProvider;

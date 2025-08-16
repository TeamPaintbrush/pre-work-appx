/**
 * Debug Hook Examples
 * Shows how components can integrate with the debug system
 */

import { useDebug } from '../components/Debug/DebugProvider';
import { useEffect, useCallback } from 'react';

// Hook for component-level debugging
export const useComponentDebug = (componentName: string) => {
  const debug = useDebug();

  useEffect(() => {
    debug.logEvent('Component Mounted', componentName);
    return () => {
      debug.logEvent('Component Unmounted', componentName);
    };
  }, [debug, componentName]);

  const logAction = useCallback((action: string, data?: any) => {
    debug.logEvent(`${componentName}: ${action}`, data);
  }, [debug, componentName]);

  const reportError = useCallback((error: Error, context?: string) => {
    debug.reportError(error, `${componentName}${context ? ` - ${context}` : ''}`);
  }, [debug, componentName]);

  const reportWarning = useCallback((message: string, context?: string) => {
    debug.reportWarning(message, `${componentName}${context ? ` - ${context}` : ''}`);
  }, [debug, componentName]);

  const addMetric = useCallback((metricName: string, value: number) => {
    debug.addMetric(`${componentName}.${metricName}`, value);
  }, [debug, componentName]);

  return {
    logAction,
    reportError,
    reportWarning,
    addMetric,
    isDebugMode: debug.isDebugMode
  };
};

// Hook for API call debugging
export const useApiDebug = () => {
  const debug = useDebug();

  const logApiCall = useCallback((method: string, url: string, data?: any) => {
    debug.logEvent('API Call', { method, url, data });
  }, [debug]);

  const logApiResponse = useCallback((method: string, url: string, status: number, duration: number) => {
    debug.logEvent('API Response', { method, url, status, duration });
    debug.addMetric('api.response_time', duration);
  }, [debug]);

  const logApiError = useCallback((method: string, url: string, error: Error) => {
    debug.reportError(error, `API ${method} ${url}`);
  }, [debug]);

  return {
    logApiCall,
    logApiResponse,
    logApiError
  };
};

// Hook for performance monitoring
export const usePerformanceDebug = () => {
  const debug = useDebug();

  const measureTime = useCallback((name: string) => {
    const startTime = performance.now();
    
    return {
      end: () => {
        const duration = performance.now() - startTime;
        debug.addMetric(`performance.${name}`, Math.round(duration));
        debug.logEvent('Performance Measurement', { name, duration: `${Math.round(duration)}ms` });
      }
    };
  }, [debug]);

  const logRenderTime = useCallback((componentName: string, renderCount: number) => {
    debug.addMetric(`render.${componentName}`, renderCount);
    if (renderCount > 5) {
      debug.reportWarning(`Component ${componentName} has rendered ${renderCount} times`, 'Performance');
    }
  }, [debug]);

  return {
    measureTime,
    logRenderTime
  };
};

// Hook for user interaction debugging
export const useInteractionDebug = () => {
  const debug = useDebug();

  const logClick = useCallback((element: string, data?: any) => {
    debug.logEvent('User Click', { element, ...data });
  }, [debug]);

  const logNavigation = useCallback((from: string, to: string) => {
    debug.logEvent('Navigation', { from, to });
  }, [debug]);

  const logFormSubmission = useCallback((formName: string, data?: any) => {
    debug.logEvent('Form Submission', { formName, ...data });
  }, [debug]);

  const logError = useCallback((action: string, error: Error) => {
    debug.reportError(error, `User Action: ${action}`);
  }, [debug]);

  return {
    logClick,
    logNavigation,
    logFormSubmission,
    logError
  };
};

export default {
  useComponentDebug,
  useApiDebug,
  usePerformanceDebug,
  useInteractionDebug
};

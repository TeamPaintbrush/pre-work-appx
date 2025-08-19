'use client';

import React, { useEffect } from 'react';
import { configureAmplify } from '../../lib/aws/amplify';

interface AmplifyProviderProps {
  children: React.ReactNode;
}

export function AmplifyProvider({ children }: AmplifyProviderProps) {
  useEffect(() => {
    // Configure Amplify on client-side only
    if (typeof window !== 'undefined') {
      configureAmplify();
    }
  }, []);

  return <>{children}</>;
}

export default AmplifyProvider;

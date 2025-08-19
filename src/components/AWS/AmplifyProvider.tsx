'use client';

import React, { useEffect, useState } from 'react';
import { configureAmplify } from '../../lib/aws/amplify';

interface AmplifyProviderProps {
  children: React.ReactNode;
}

export function AmplifyProvider({ children }: AmplifyProviderProps) {
  const [isConfigured, setIsConfigured] = useState(false);
  const [useAWSFeatures, setUseAWSFeatures] = useState(false);

  useEffect(() => {
    // Configure Amplify on client-side only
    if (typeof window !== 'undefined') {
      try {
        // Check if AWS features should be enabled
        const enableAWS = process.env.NEXT_PUBLIC_ENABLE_AWS_FEATURES === 'true';
        const hasAWSConfig = Boolean(
          process.env.NEXT_PUBLIC_AWS_REGION &&
          (process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || process.env.AWS_ACCESS_KEY_ID)
        );

        setUseAWSFeatures(enableAWS && hasAWSConfig);

        if (enableAWS && hasAWSConfig) {
          configureAmplify();
          console.log('✅ AWS Amplify configured successfully');
          console.log('🔧 AWS Features enabled:', {
            region: process.env.NEXT_PUBLIC_AWS_REGION,
            dynamodb: Boolean(process.env.NEXT_PUBLIC_DYNAMODB_TEMPLATES_TABLE),
            s3: Boolean(process.env.NEXT_PUBLIC_S3_BUCKET),
            realTimeSync: process.env.NEXT_PUBLIC_ENABLE_REAL_TIME_SYNC === 'true',
            analytics: process.env.NEXT_PUBLIC_ENABLE_ADVANCED_ANALYTICS === 'true',
            integrations: process.env.NEXT_PUBLIC_ENABLE_INTEGRATION_HUB === 'true'
          });
        } else {
          console.log('📝 AWS features disabled or not configured - using mock data');
        }
        
        setIsConfigured(true);
      } catch (error) {
        console.warn('⚠️ AWS Amplify configuration failed:', error);
        console.log('📝 Falling back to mock data mode');
        setUseAWSFeatures(false);
        setIsConfigured(true);
      }
    }
  }, []);

  // Show loading state while configuring
  if (!isConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {useAWSFeatures ? 'Configuring AWS services...' : 'Initializing app...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-aws-enabled={useAWSFeatures} data-testid="amplify-provider">
      {children}
    </div>
  );
}

export default AmplifyProvider;

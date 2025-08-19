import { Amplify } from 'aws-amplify';
import type { ResourcesConfig } from 'aws-amplify';

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_xxxxxxxxx',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
      identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      loginWith: {
        email: true,
        username: false,
        phone: false,
      },
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: { required: true },
        name: { required: true },
      },
      allowGuestAccess: true,
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true,
      },
    },
  },
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev',
      region: process.env.REGION || process.env.NEXT_PUBLIC_REGION || process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      defaultAuthMode: 'userPool' as const,
    },
    REST: {
      'PreWorkAppAPI': {
        endpoint: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev',
        region: process.env.REGION || process.env.NEXT_PUBLIC_REGION || process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      }
    }
  },
  Storage: {
    S3: {
      bucket: process.env.NEXT_PUBLIC_S3_BUCKET || 'preworkapp-storage-dev',
      region: process.env.REGION || process.env.NEXT_PUBLIC_REGION || process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    },
  },
  Analytics: {
    Pinpoint: {
      appId: process.env.NEXT_PUBLIC_PINPOINT_APP_ID || 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
      region: process.env.REGION || process.env.NEXT_PUBLIC_REGION || process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    },
  },
};

export function configureAmplify() {
  try {
    Amplify.configure(amplifyConfig);
    console.log('✅ AWS Amplify configured successfully');
  } catch (error) {
    console.error('❌ Failed to configure AWS Amplify:', error);
    // Use mock data in development/fallback mode
    console.log('🔄 Using mock data for development');
  }
}

export default amplifyConfig;

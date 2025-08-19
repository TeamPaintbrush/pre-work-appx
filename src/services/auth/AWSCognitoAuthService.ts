/**
 * AWS COGNITO AUTHENTICATION SERVICE
 * Enterprise-grade authentication with Cognito integration
 * Supports user registration, login, MFA, session management
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
  CognitoRefreshToken
} from 'amazon-cognito-identity-js';
import { CognitoIdentityCredentials } from 'aws-sdk/global';
import AWS from 'aws-sdk';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organization?: string;
  role?: string;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresAt: Date;
  user: AuthUser;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization?: string;
  role?: string;
}

export interface PasswordResetData {
  email: string;
  code: string;
  newPassword: string;
}

export class AWSCognitoAuthService {
  private userPool: CognitoUserPool;
  private currentUser: CognitoUser | null = null;
  private currentSession: CognitoUserSession | null = null;
  private authCallbacks: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    // Initialize Cognito User Pool
    this.userPool = new CognitoUserPool({
      UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
      ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''
    });

    // Configure AWS SDK
    AWS.config.region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
    
    // Auto-restore session on initialization
    this.restoreSession();
  }

  /**
   * Register a new user with Cognito
   */
  async register(userData: RegisterData): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> {
    try {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: userData.email }),
        new CognitoUserAttribute({ Name: 'given_name', Value: userData.firstName }),
        new CognitoUserAttribute({ Name: 'family_name', Value: userData.lastName })
      ];

      if (userData.organization) {
        attributeList.push(new CognitoUserAttribute({ Name: 'custom:organization', Value: userData.organization }));
      }

      if (userData.role) {
        attributeList.push(new CognitoUserAttribute({ Name: 'custom:role', Value: userData.role }));
      }

      return new Promise((resolve, reject) => {
        this.userPool.signUp(
          userData.email,
          userData.password,
          attributeList,
          [],
          (err: any, result: any) => {
            if (err) {
              console.error('Registration error:', err);
              resolve({
                success: false,
                message: this.getErrorMessage(err)
              });
              return;
            }

            console.log('Registration successful:', result?.user.getUsername());
            resolve({
              success: true,
              message: 'Registration successful! Please check your email for verification.',
              requiresVerification: !result?.userConfirmed
            });
          }
        );
      });
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  /**
   * Verify email address with confirmation code
   */
  async verifyEmail(email: string, code: string): Promise<{ success: boolean; message: string }> {
    try {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: this.userPool
      });

      return new Promise((resolve) => {
        cognitoUser.confirmRegistration(code, true, (err: any, result: any) => {
          if (err) {
            console.error('Email verification error:', err);
            resolve({
              success: false,
              message: this.getErrorMessage(err)
            });
            return;
          }

          console.log('Email verification successful:', result);
          resolve({
            success: true,
            message: 'Email verified successfully! You can now log in.'
          });
        });
      });
    } catch (error) {
      console.error('Email verification failed:', error);
      return {
        success: false,
        message: 'Email verification failed. Please try again.'
      };
    }
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; session?: AuthSession; message: string; requiresMFA?: boolean }> {
    try {
      const authenticationDetails = new AuthenticationDetails({
        Username: credentials.email,
        Password: credentials.password
      });

      const cognitoUser = new CognitoUser({
        Username: credentials.email,
        Pool: this.userPool
      });

      return new Promise((resolve) => {
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: async (session: CognitoUserSession) => {
            console.log('Login successful');
            
            this.currentUser = cognitoUser;
            this.currentSession = session;

            // Configure AWS credentials
            await this.configureAWSCredentials(session);

            // Build auth session
            const authSession = await this.buildAuthSession(session, cognitoUser);
            
            // Store session if remember me is enabled
            if (credentials.rememberMe) {
              this.storeSession(session);
            }

            // Notify auth state change
            this.notifyAuthStateChange(authSession.user);

            resolve({
              success: true,
              session: authSession,
              message: 'Login successful!'
            });
          },

          onFailure: (err: any) => {
            console.error('Login error:', err);
            resolve({
              success: false,
              message: this.getErrorMessage(err)
            });
          },

          mfaRequired: (challengeName: any, challengeParameters: any) => {
            console.log('MFA required:', challengeName);
            resolve({
              success: false,
              message: 'MFA verification required',
              requiresMFA: true
            });
          },

          newPasswordRequired: (userAttributes: any, requiredAttributes: any) => {
            console.log('New password required');
            resolve({
              success: false,
              message: 'Password change required. Please contact support.'
            });
          }
        });
      });
    } catch (error) {
      console.error('Login failed:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.'
      };
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      if (this.currentUser) {
        this.currentUser.signOut();
      }

      // Clear stored session
      this.clearStoredSession();

      // Reset current state
      this.currentUser = null;
      this.currentSession = null;

      // Clear AWS credentials
      AWS.config.credentials = null;

      // Notify auth state change
      this.notifyAuthStateChange(null);

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (!this.currentSession || !this.currentUser) {
        await this.restoreSession();
      }

      if (!this.currentSession || !this.currentUser) {
        return null;
      }

      return this.extractUserFromSession(this.currentSession);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!(this.currentSession && this.currentSession.isValid());
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<AuthSession | null> {
    try {
      if (!this.currentUser || !this.currentSession) {
        return null;
      }

      const refreshToken = this.currentSession.getRefreshToken();

      return new Promise((resolve) => {
        this.currentUser!.refreshSession(refreshToken, (err: any, session: any) => {
          if (err) {
            console.error('Session refresh error:', err);
            resolve(null);
            return;
          }

          this.currentSession = session;
          this.configureAWSCredentials(session);

          resolve(this.buildAuthSession(session, this.currentUser!));
        });
      });
    } catch (error) {
      console.error('Session refresh failed:', error);
      return null;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: this.userPool
      });

      return new Promise((resolve) => {
        cognitoUser.forgotPassword({
          onSuccess: () => {
            resolve({
              success: true,
              message: 'Password reset code sent to your email.'
            });
          },
          onFailure: (err: any) => {
            console.error('Password reset request error:', err);
            resolve({
              success: false,
              message: this.getErrorMessage(err)
            });
          }
        });
      });
    } catch (error) {
      console.error('Password reset request failed:', error);
      return {
        success: false,
        message: 'Password reset request failed. Please try again.'
      };
    }
  }

  /**
   * Confirm password reset with code
   */
  async confirmPasswordReset(data: PasswordResetData): Promise<{ success: boolean; message: string }> {
    try {
      const cognitoUser = new CognitoUser({
        Username: data.email,
        Pool: this.userPool
      });

      return new Promise((resolve) => {
        cognitoUser.confirmPassword(data.code, data.newPassword, {
          onSuccess: () => {
            resolve({
              success: true,
              message: 'Password reset successful! You can now log in with your new password.'
            });
          },
          onFailure: (err: any) => {
            console.error('Password reset confirmation error:', err);
            resolve({
              success: false,
              message: this.getErrorMessage(err)
            });
          }
        });
      });
    } catch (error) {
      console.error('Password reset confirmation failed:', error);
      return {
        success: false,
        message: 'Password reset failed. Please try again.'
      };
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.authCallbacks.indexOf(callback);
      if (index > -1) {
        this.authCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Private: Restore session from storage
   */
  private async restoreSession(): Promise<void> {
    try {
      const currentUser = this.userPool.getCurrentUser();
      if (!currentUser) return;

      this.currentUser = currentUser;

      return new Promise((resolve) => {
        currentUser.getSession((err: any, session: CognitoUserSession) => {
          if (err || !session || !session.isValid()) {
            console.log('No valid session found');
            resolve();
            return;
          }

          this.currentSession = session;
          this.configureAWSCredentials(session);
          
          // Notify auth state change
          const user = this.extractUserFromSession(session);
          this.notifyAuthStateChange(user);

          console.log('Session restored successfully');
          resolve();
        });
      });
    } catch (error) {
      console.error('Session restoration failed:', error);
    }
  }

  /**
   * Private: Configure AWS credentials with Cognito token
   */
  private async configureAWSCredentials(session: CognitoUserSession): Promise<void> {
    try {
      const idToken = session.getIdToken().getJwtToken();
      
      AWS.config.credentials = new CognitoIdentityCredentials({
        IdentityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID || '',
        Logins: {
          [`cognito-idp.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID}`]: idToken
        }
      });

      // Refresh credentials
      await new Promise((resolve, reject) => {
        (AWS.config.credentials as CognitoIdentityCredentials).refresh((err: any) => {
          if (err) {
            console.error('AWS credentials refresh error:', err);
            reject(err);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('AWS credentials configuration failed:', error);
    }
  }

  /**
   * Private: Build auth session object
   */
  private async buildAuthSession(session: CognitoUserSession, cognitoUser: CognitoUser): Promise<AuthSession> {
    const user = this.extractUserFromSession(session);
    
    return {
      accessToken: session.getAccessToken().getJwtToken(),
      idToken: session.getIdToken().getJwtToken(),
      refreshToken: session.getRefreshToken().getToken(),
      expiresAt: new Date(session.getAccessToken().getExpiration() * 1000),
      user
    };
  }

  /**
   * Private: Extract user data from session
   */
  private extractUserFromSession(session: CognitoUserSession): AuthUser {
    const idTokenPayload = session.getIdToken().payload;
    
    return {
      id: idTokenPayload.sub,
      email: idTokenPayload.email || '',
      firstName: idTokenPayload.given_name || '',
      lastName: idTokenPayload.family_name || '',
      organization: idTokenPayload['custom:organization'],
      role: idTokenPayload['custom:role'],
      isEmailVerified: idTokenPayload.email_verified === true,
      mfaEnabled: false, // TODO: Check MFA status
      lastLoginAt: new Date(),
      createdAt: new Date(idTokenPayload.iat * 1000),
      updatedAt: new Date()
    };
  }

  /**
   * Private: Store session in local storage
   */
  private storeSession(session: CognitoUserSession): void {
    try {
      localStorage.setItem('cognitoSession', JSON.stringify({
        accessToken: session.getAccessToken().getJwtToken(),
        idToken: session.getIdToken().getJwtToken(),
        refreshToken: session.getRefreshToken().getToken(),
        expiresAt: session.getAccessToken().getExpiration() * 1000
      }));
    } catch (error) {
      console.error('Session storage failed:', error);
    }
  }

  /**
   * Private: Clear stored session
   */
  private clearStoredSession(): void {
    try {
      localStorage.removeItem('cognitoSession');
    } catch (error) {
      console.error('Session clearing failed:', error);
    }
  }

  /**
   * Private: Notify auth state change to subscribers
   */
  private notifyAuthStateChange(user: AuthUser | null): void {
    this.authCallbacks.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Auth state change callback error:', error);
      }
    });
  }

  /**
   * Private: Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (!error) return 'An unknown error occurred';
    
    switch (error.code) {
      case 'UserNotFoundException':
        return 'No account found with this email address';
      case 'NotAuthorizedException':
        return 'Invalid email or password';
      case 'UserNotConfirmedException':
        return 'Please verify your email address before logging in';
      case 'PasswordResetRequiredException':
        return 'Password reset required. Please check your email';
      case 'UserLambdaValidationException':
        return 'User validation failed';
      case 'TooManyRequestsException':
        return 'Too many requests. Please try again later';
      case 'InvalidPasswordException':
        return 'Password does not meet requirements';
      case 'InvalidParameterException':
        return 'Invalid input parameters';
      case 'CodeMismatchException':
        return 'Invalid verification code';
      case 'ExpiredCodeException':
        return 'Verification code has expired';
      case 'LimitExceededException':
        return 'Attempt limit exceeded. Please try again later';
      default:
        return error.message || 'An error occurred. Please try again';
    }
  }
}

// Create singleton instance
export const authService = new AWSCognitoAuthService();

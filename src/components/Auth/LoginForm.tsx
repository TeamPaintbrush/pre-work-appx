/**
 * LOGIN FORM COMPONENT
 * Professional login interface with AWS Cognito integration
 * Includes email/password login, registration, and password reset
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useCognitoAuth } from '../../providers/CognitoAuthProvider';
import { LoginCredentials, RegisterData, PasswordResetData } from '../../services/auth/AWSCognitoAuthService';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

type FormMode = 'login' | 'register' | 'reset-password' | 'verify-email' | 'confirm-reset';

export function LoginForm({ onSuccess, onError, redirectTo }: LoginFormProps) {
  const { login, register, verifyEmail, requestPasswordReset, confirmPasswordReset, isLoading } = useCognitoAuth();
  
  const [mode, setMode] = useState<FormMode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organization: '',
    role: '',
    verificationCode: '',
    resetCode: '',
    newPassword: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (for login and register)
    if ((mode === 'login' || mode === 'register') && !formData.password) {
      newErrors.password = 'Password is required';
    }

    // Registration-specific validation
    if (mode === 'register') {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      // Password strength validation
      if (formData.password && formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      }
    }

    // Verification code validation
    if ((mode === 'verify-email' || mode === 'confirm-reset') && !formData.verificationCode) {
      newErrors.verificationCode = 'Verification code is required';
    }

    // New password validation for reset
    if (mode === 'confirm-reset') {
      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [mode, formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setMessage('');
    setErrors({});

    try {
      let result;

      switch (mode) {
        case 'login':
          const loginCredentials: LoginCredentials = {
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe
          };
          result = await login(loginCredentials);
          
          if (result.success) {
            setMessage('Login successful! Redirecting...');
            onSuccess?.();
            if (redirectTo) {
              window.location.href = redirectTo;
            }
          } else {
            if (result.requiresMFA) {
              setMessage('MFA verification required. Please check your device.');
            } else {
              setErrors({ form: result.message });
              onError?.(result.message);
            }
          }
          break;

        case 'register':
          const registerData: RegisterData = {
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            organization: formData.organization || undefined,
            role: formData.role || undefined
          };
          result = await register(registerData);
          
          if (result.success) {
            if (result.requiresVerification) {
              setMode('verify-email');
              setMessage('Registration successful! Please check your email for a verification code.');
            } else {
              setMessage('Registration successful! You can now log in.');
              setMode('login');
            }
          } else {
            setErrors({ form: result.message });
            onError?.(result.message);
          }
          break;

        case 'verify-email':
          result = await verifyEmail(formData.email, formData.verificationCode);
          
          if (result.success) {
            setMessage('Email verified successfully! You can now log in.');
            setMode('login');
            setFormData(prev => ({ ...prev, verificationCode: '' }));
          } else {
            setErrors({ verificationCode: result.message });
          }
          break;

        case 'reset-password':
          result = await requestPasswordReset(formData.email);
          
          if (result.success) {
            setMode('confirm-reset');
            setMessage('Password reset code sent to your email.');
          } else {
            setErrors({ email: result.message });
          }
          break;

        case 'confirm-reset':
          const resetData: PasswordResetData = {
            email: formData.email,
            code: formData.verificationCode,
            newPassword: formData.newPassword
          };
          result = await confirmPasswordReset(resetData);
          
          if (result.success) {
            setMessage('Password reset successful! You can now log in with your new password.');
            setMode('login');
            setFormData(prev => ({
              ...prev,
              password: '',
              verificationCode: '',
              newPassword: ''
            }));
          } else {
            setErrors({ verificationCode: result.message });
          }
          break;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
    }
  }, [mode, formData, validateForm, login, register, verifyEmail, requestPasswordReset, confirmPasswordReset, onSuccess, onError, redirectTo]);

  const handleInputChange = useCallback((field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const renderFormTitle = () => {
    switch (mode) {
      case 'login':
        return 'Sign In to Your Account';
      case 'register':
        return 'Create Your Account';
      case 'verify-email':
        return 'Verify Your Email';
      case 'reset-password':
        return 'Reset Your Password';
      case 'confirm-reset':
        return 'Set New Password';
      default:
        return 'Authentication';
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange('rememberMe')}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('reset-password')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                  disabled={isLoading}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">Don't have an account? </span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                Sign up
              </button>
            </div>
          </>
        );

      case 'register':
        return (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="First name"
                    disabled={isLoading}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Last name"
                    disabled={isLoading}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Create a password (min. 8 characters)"
                  disabled={isLoading}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                    Organization (Optional)
                  </label>
                  <input
                    id="organization"
                    type="text"
                    value={formData.organization}
                    onChange={handleInputChange('organization')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your organization"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role (Optional)
                  </label>
                  <input
                    id="role"
                    type="text"
                    value={formData.role}
                    onChange={handleInputChange('role')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your role"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                Sign in
              </button>
            </div>
          </>
        );

      case 'verify-email':
        return (
          <>
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                Enter the verification code sent to <strong>{formData.email}</strong>
              </div>

              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={formData.verificationCode}
                  onChange={handleInputChange('verificationCode')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.verificationCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter verification code"
                  disabled={isLoading}
                />
                {errors.verificationCode && <p className="text-red-500 text-sm mt-1">{errors.verificationCode}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                Back to Sign In
              </button>
            </div>
          </>
        );

      case 'reset-password':
        return (
          <>
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                Enter your email address and we'll send you a code to reset your password.
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending Code...' : 'Send Reset Code'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                Back to Sign In
              </button>
            </div>
          </>
        );

      case 'confirm-reset':
        return (
          <>
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-4">
                Enter the reset code sent to <strong>{formData.email}</strong> and your new password.
              </div>

              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Reset Code
                </label>
                <input
                  id="verificationCode"
                  type="text"
                  value={formData.verificationCode}
                  onChange={handleInputChange('verificationCode')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.verificationCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter reset code"
                  disabled={isLoading}
                />
                {errors.verificationCode && <p className="text-red-500 text-sm mt-1">{errors.verificationCode}</p>}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleInputChange('newPassword')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter new password (min. 8 characters)"
                  disabled={isLoading}
                />
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-sm text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                Back to Sign In
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{renderFormTitle()}</h2>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderForm()}
      </form>
    </div>
  );
}

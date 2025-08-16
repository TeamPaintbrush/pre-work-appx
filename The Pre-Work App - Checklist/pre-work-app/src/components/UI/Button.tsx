"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { buttonVariants } from '../Animation/AnimationProvider';
import { useAccessibilityPreferences } from '../../hooks/useAccessibility';
import { ButtonProps } from '../../types';

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...props 
}) => {
  const { prefersReducedMotion, prefersHighContrast } = useAccessibilityPreferences();
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm';
  
  // Enhanced color classes with high contrast support
  const variantClasses = {
    primary: prefersHighContrast 
      ? 'bg-blue-800 text-white hover:bg-blue-900 focus:ring-blue-300 border-2 border-blue-400' 
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: prefersHighContrast 
      ? 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-300 border-2 border-gray-400' 
      : 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    success: prefersHighContrast 
      ? 'bg-green-800 text-white hover:bg-green-900 focus:ring-green-300 border-2 border-green-400' 
      : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: prefersHighContrast 
      ? 'bg-red-800 text-white hover:bg-red-900 focus:ring-red-300 border-2 border-red-400' 
      : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    warning: prefersHighContrast 
      ? 'bg-yellow-900 text-white hover:bg-yellow-950 focus:ring-yellow-300 border-2 border-yellow-400' 
      : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    info: prefersHighContrast 
      ? 'bg-cyan-800 text-white hover:bg-cyan-900 focus:ring-cyan-300 border-2 border-cyan-400' 
      : 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500',
    outline: prefersHighContrast 
      ? 'border-2 border-gray-800 bg-white text-gray-900 hover:bg-gray-100 focus:ring-blue-300' 
      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  };
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs min-h-[24px]',
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-sm min-h-[40px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
    xl: 'px-8 py-4 text-lg min-h-[56px]'
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`.trim();
  
  // Create accessible loading text
  const accessibleLoadingText = isLoading ? `Loading${loadingText ? `: ${loadingText}` : '...'}` : '';
  
  return (
    <motion.button
      className={classes}
      disabled={disabled || isLoading}
      variants={prefersReducedMotion ? {} : buttonVariants}
      initial={prefersReducedMotion ? false : "initial"}
      whileHover={!disabled && !isLoading && !prefersReducedMotion ? "hover" : undefined}
      whileTap={!disabled && !isLoading && !prefersReducedMotion ? "tap" : undefined}
      type={props.type || 'button'}
      onClick={props.onClick}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      tabIndex={props.tabIndex}
      role={props.role}
      aria-label={props['aria-label']}
      aria-disabled={disabled || isLoading}
      aria-describedby={isLoading ? `${props.id || 'button'}-loading` : undefined}
    >
      {leftIcon && <span className="mr-2" aria-hidden="true">{leftIcon}</span>}
      {isLoading && (
        <>
          <svg 
            className={`${prefersReducedMotion ? '' : 'animate-spin'} -ml-1 mr-2 h-4 w-4`} 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="sr-only" id={`${props.id || 'button'}-loading`}>
            {accessibleLoadingText}
          </span>
        </>
      )}
      <span className={isLoading ? 'opacity-75' : ''}>
        {isLoading && loadingText ? loadingText : children}
      </span>
      {rightIcon && <span className="ml-2" aria-hidden="true">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;
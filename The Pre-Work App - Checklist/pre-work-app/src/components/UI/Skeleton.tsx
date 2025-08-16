"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  lines?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  lines = 1,
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded',
  };

  const pulseVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
          <motion.div
            key={index}
            className={`${baseClasses} ${variantClasses[variant]} h-4`}
            style={{
              width: index === lines - 1 ? '75%' : '100%',
            }}
            variants={pulseVariants}
            animate="animate"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
      variants={pulseVariants}
      animate="animate"
    />
  );
};

// Predefined skeleton components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`border rounded-lg p-4 space-y-3 ${className}`}>
    <Skeleton height="1.5rem" width="70%" />
    <Skeleton variant="text" lines={2} />
    <div className="flex space-x-2">
      <Skeleton width="80px" height="32px" />
      <Skeleton width="80px" height="32px" />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className = '' 
}) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export const SkeletonProgressBar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <div className="flex justify-between">
      <Skeleton width="100px" height="1rem" />
      <Skeleton width="50px" height="1rem" />
    </div>
    <Skeleton height="12px" className="rounded-full" />
  </div>
);

export const SkeletonChecklistItem: React.FC<{ className?: string }> = ({ className = '' }) => (
  <motion.div 
    className={`border rounded-lg p-4 space-y-3 ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-start space-x-3">
      <Skeleton variant="rectangular" width="20px" height="20px" />
      <div className="flex-1 space-y-2">
        <Skeleton height="1.25rem" width="85%" />
        <Skeleton variant="text" lines={1} width="60%" />
      </div>
    </div>
  </motion.div>
);

export default Skeleton;

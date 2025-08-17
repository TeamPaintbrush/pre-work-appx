"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ProgressBarProps } from '../../types';
import { useMobileDetection } from '../../hooks/useMobile';

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  const { isMobile } = useMobileDetection();
  const { totalItems, completedItems, requiredItems, completedRequiredItems, percentage } = progress;

  const getProgressColor = () => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRequiredProgress = () => {
    return requiredItems > 0 ? Math.round((completedRequiredItems / requiredItems) * 100) : 0;
  };

  const celebrationVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: [0, 1.2, 1], 
      opacity: [0, 1, 1],
      transition: {
        duration: 0.6,
        times: [0, 0.6, 1]
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Overall Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className={`font-medium text-gray-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Overall Progress
          </span>
          <motion.span 
            className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}
            key={`${completedItems}-${totalItems}`}
            initial={{ scale: 1.1, color: '#10B981' }}
            animate={{ scale: 1, color: '#4B5563' }}
            transition={{ duration: 0.3 }}
          >
            {isMobile ? `${completedItems}/${totalItems}` : `${completedItems}/${totalItems} tasks (${percentage}%)`}
          </motion.span>
          {percentage === 100 && (
            <motion.span
              className="ml-2 text-green-500"
              variants={celebrationVariants}
              initial="hidden"
              animate="visible"
            >
              🎉
            </motion.span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative">
          <motion.div
            className={`h-full transition-colors duration-300 ${getProgressColor()} relative overflow-hidden`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{
              duration: 1.2,
              ease: [0.4, 0, 0.2, 1] as const
            }}
          >
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: [-100, 100],
                transition: {
                  duration: 2,
                  repeat: percentage < 100 ? Infinity : 0,
                  ease: "easeInOut"
                }
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* Required Items Progress */}
      {requiredItems > 0 && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-red-700">
              Required Tasks
            </span>
            <motion.span 
              className="text-sm text-red-600"
              key={`${completedRequiredItems}-${requiredItems}`}
              initial={{ scale: 1.1, color: '#EF4444' }}
              animate={{ scale: 1, color: '#DC2626' }}
              transition={{ duration: 0.3 }}
            >
              {completedRequiredItems}/{requiredItems} required ({getRequiredProgress()}%)
            </motion.span>
            {getRequiredProgress() === 100 && (
              <motion.span
                className="ml-2 text-green-500"
                variants={celebrationVariants}
                initial="hidden"
                animate="visible"
              >
                ✅
              </motion.span>
            )}
          </div>
          <div className="w-full bg-red-100 rounded-full h-2 overflow-hidden relative">
            <motion.div
              className="h-full bg-red-500 relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${getRequiredProgress()}%` }}
              transition={{
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1] as const,
                delay: 0.3
              }}
            >
              {/* Shine effect for required tasks */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{
                  x: [-50, 50],
                  transition: {
                    duration: 1.5,
                    repeat: getRequiredProgress() < 100 ? Infinity : 0,
                    ease: "easeInOut"
                  }
                }}
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* Progress Stats */}
      <motion.div 
        className="grid grid-cols-2 gap-4 text-xs text-gray-600 pt-2 border-t border-gray-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <div>
          <span className="block font-medium">Completed</span>
          <span>{completedItems} items</span>
        </div>
        <div>
          <span className="block font-medium">Remaining</span>
          <span>{totalItems - completedItems} items</span>
        </div>
      </motion.div>

      {/* Completion Status */}
      {percentage === 100 && (
        <motion.div 
          className="flex items-center justify-center p-3 bg-green-50 border border-green-200 rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <span className="text-green-700 font-medium">🎉 All tasks completed!</span>
        </motion.div>
      )}
    </div>
  );
};

export default ProgressBar;
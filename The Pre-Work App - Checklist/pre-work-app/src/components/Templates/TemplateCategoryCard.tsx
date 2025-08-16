'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TemplateCategory } from '../../types';

interface TemplateCategoryCardProps {
  category: TemplateCategory;
  templateCount: number;
  onClick: () => void;
  className?: string;
}

const TemplateCategoryCard: React.FC<TemplateCategoryCardProps> = ({
  category,
  templateCount,
  onClick,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 h-full">
        {/* Category Icon and Header */}
        <div className="flex items-center justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${category.color}20`, color: category.color }}
          >
            {category.icon}
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {templateCount} template{templateCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Category Details */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
            {category.name}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            {category.description}
          </p>

          {/* Visual Indicator */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Browse templates
            </span>
            <motion.div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: category.color }}
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white text-sm font-bold">→</span>
            </motion.div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ 
            background: `linear-gradient(135deg, ${category.color}10, transparent)`,
            opacity: 0
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
};

export default TemplateCategoryCard;

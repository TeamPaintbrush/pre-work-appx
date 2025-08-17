'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChecklistTemplate } from '../../types';

interface TemplateCardProps {
  template: ChecklistTemplate;
  onClick: () => void;
  className?: string;
  userRole?: 'worker' | 'manager' | 'admin';
  showManagementActions?: boolean;
  onEdit?: (template: ChecklistTemplate) => void;
  onVersion?: (template: ChecklistTemplate) => void;
  onShare?: (template: ChecklistTemplate) => void;
  onDelete?: (template: ChecklistTemplate) => void;
  onFavorite?: (template: ChecklistTemplate) => void;
  isFavorite?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onClick,
  className = '',
  userRole = 'worker',
  showManagementActions = false,
  onEdit,
  onVersion,
  onShare,
  onDelete,
  onFavorite,
  isFavorite = false
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const sectionCount = template.sections.length;
  const itemCount = template.sections.reduce((total, section) => total + section.items.length, 0);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent card click
    action();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`cursor-pointer relative ${className}`}
      onClick={onClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                {template.name}
              </h3>
              {!template.isBuiltIn && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  Custom
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {template.description}
            </p>
          </div>
          
          <div className="ml-3 flex-shrink-0 flex items-center space-x-2">
            {/* Favorite Button */}
            {onFavorite && (
              <button
                onClick={(e) => handleActionClick(e, () => onFavorite(template))}
                className={`p-1 rounded-full transition-colors ${
                  isFavorite 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {isFavorite ? '⭐' : '☆'}
              </button>
            )}

            {/* Management Actions */}
            {showManagementActions && (userRole === 'manager' || userRole === 'admin') && (
              <div className="flex items-center space-x-1">
                {onShare && (
                  <button
                    onClick={(e) => handleActionClick(e, () => onShare(template))}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Share template"
                  >
                    🤝
                  </button>
                )}
                
                {onVersion && (
                  <button
                    onClick={(e) => handleActionClick(e, () => onVersion(template))}
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    title="Version history"
                  >
                    📚
                  </button>
                )}
                
                {onEdit && !template.isBuiltIn && (
                  <button
                    onClick={(e) => handleActionClick(e, () => onEdit(template))}
                    className="p-1 text-gray-400 hover:text-orange-500 transition-colors"
                    title="Edit template"
                  >
                    ✏️
                  </button>
                )}
                
                {onDelete && !template.isBuiltIn && userRole === 'admin' && (
                  <button
                    onClick={(e) => handleActionClick(e, () => onDelete(template))}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete template"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}

            {template.isBuiltIn && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Built-in
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>{sectionCount} section{sectionCount !== 1 ? 's' : ''}</span>
            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
          </div>
          <span>{formatDuration(template.estimatedDuration)}</span>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {template.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {template.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{template.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Skills Required */}
        {template.requiredSkills && template.requiredSkills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Skills:
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {template.requiredSkills.slice(0, 2).join(', ')}
              {template.requiredSkills.length > 2 && (
                <span className="text-gray-500 dark:text-gray-500">
                  {' '}+{template.requiredSkills.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            {template.difficulty && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                {template.difficulty}
              </span>
            )}
          </div>
          
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span>v{template.version}</span>
            <motion.div
              className="ml-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white text-xs font-bold">→</span>
            </motion.div>
          </div>
        </div>

        {/* Category Color Accent */}
        <div 
          className="absolute top-0 left-0 w-full h-1 rounded-t-xl"
          style={{ backgroundColor: template.category.color }}
        />
      </div>
    </motion.div>
  );
};

export default TemplateCard;

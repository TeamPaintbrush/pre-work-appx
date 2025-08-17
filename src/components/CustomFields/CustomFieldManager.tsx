"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAriaLiveRegion, useAccessibilityPreferences } from '../../hooks/useAccessibility';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: CustomFieldType;
  description?: string;
  isRequired: boolean;
  isEnabled: boolean;
  options?: CustomFieldOption[];
  validation?: CustomFieldValidation;
  defaultValue?: any;
  placeholder?: string;
  order: number;
  category?: string;
  createdAt: Date;
  lastModified: Date;
}

export type CustomFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'url'
  | 'tel'
  | 'date'
  | 'datetime'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'boolean'
  | 'file'
  | 'color'
  | 'range'
  | 'rating';

export interface CustomFieldOption {
  id: string;
  value: string;
  label: string;
  isDefault?: boolean;
  color?: string;
  icon?: string;
}

export interface CustomFieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  required?: boolean;
  customValidator?: string;
}

export interface CustomFieldValue {
  fieldId: string;
  value: any;
  timestamp: Date;
  userId?: string;
}

interface CustomFieldManagerProps {
  fields: CustomField[];
  values?: Record<string, CustomFieldValue>;
  onCreateField: (field: Omit<CustomField, 'id' | 'createdAt' | 'lastModified'>) => void;
  onUpdateField: (id: string, updates: Partial<CustomField>) => void;
  onDeleteField: (id: string) => void;
  onUpdateValue: (fieldId: string, value: any) => void;
  mode: 'design' | 'fill';
  readonly?: boolean;
}

const CustomFieldManager: React.FC<CustomFieldManagerProps> = ({
  fields,
  values = {},
  onCreateField,
  onUpdateField,
  onDeleteField,
  onUpdateValue,
  mode,
  readonly = false
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  const { announce } = useAriaLiveRegion();
  const { prefersReducedMotion, prefersHighContrast } = useAccessibilityPreferences();

  // Initialize field values from props
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    Object.entries(values).forEach(([fieldId, fieldValue]) => {
      initialValues[fieldId] = fieldValue.value;
    });
    setFieldValues(initialValues);
  }, [values]);

  const enabledFields = fields.filter(field => field.isEnabled).sort((a, b) => a.order - b.order);

  const handleValueChange = (fieldId: string, value: any) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    onUpdateValue(fieldId, value);
  };

  const getFieldTypeIcon = (type: CustomFieldType): string => {
    switch (type) {
      case 'text': return '📝';
      case 'textarea': return '📄';
      case 'number': return '🔢';
      case 'email': return '📧';
      case 'url': return '🔗';
      case 'tel': return '📞';
      case 'date': return '📅';
      case 'datetime': return '🕐';
      case 'time': return '⏰';
      case 'select': return '📋';
      case 'multiselect': return '☑️';
      case 'radio': return '🔘';
      case 'checkbox': return '✅';
      case 'boolean': return '🔄';
      case 'file': return '📎';
      case 'color': return '🎨';
      case 'range': return '📏';
      case 'rating': return '⭐';
      default: return '📝';
    }
  };

  const validateField = (field: CustomField, value: any): string | null => {
    if (field.isRequired && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    if (!field.validation) return null;

    const validation = field.validation;

    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        return `${field.label} must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        return `${field.label} must be no more than ${validation.maxLength} characters`;
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        return `${field.label} format is invalid`;
      }
    }

    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        return `${field.label} must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && value > validation.max) {
        return `${field.label} must be no more than ${validation.max}`;
      }
    }

    return null;
  };

  const renderFieldInput = (field: CustomField) => {
    const value = fieldValues[field.id] || field.defaultValue || '';
    const hasError = validateField(field, value) !== null;
    const errorMessage = validateField(field, value);

    const baseInputClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
      hasError
        ? 'border-red-500 bg-red-50'
        : prefersHighContrast
        ? 'border-gray-800 bg-white'
        : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'tel':
        return (
          <div>
            <input
              type={field.type}
              id={field.id}
              value={value}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.isRequired}
              disabled={readonly}
              className={baseInputClasses}
              aria-describedby={`${field.id}-hint ${hasError ? `${field.id}-error` : ''}`}
              aria-invalid={hasError}
            />
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div>
            <textarea
              id={field.id}
              value={value}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.isRequired}
              disabled={readonly}
              rows={4}
              className={baseInputClasses}
              aria-describedby={`${field.id}-hint ${hasError ? `${field.id}-error` : ''}`}
              aria-invalid={hasError}
            />
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'number':
      case 'range':
        return (
          <div>
            <input
              type={field.type}
              id={field.id}
              value={value}
              onChange={(e) => handleValueChange(field.id, parseFloat(e.target.value) || 0)}
              min={field.validation?.min}
              max={field.validation?.max}
              required={field.isRequired}
              disabled={readonly}
              className={baseInputClasses}
              aria-describedby={`${field.id}-hint ${hasError ? `${field.id}-error` : ''}`}
              aria-invalid={hasError}
            />
            {field.type === 'range' && (
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{field.validation?.min || 0}</span>
                <span>{value}</span>
                <span>{field.validation?.max || 100}</span>
              </div>
            )}
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'date':
      case 'datetime':
      case 'time':
        return (
          <div>
            <input
              type={field.type === 'datetime' ? 'datetime-local' : field.type}
              id={field.id}
              value={value}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
              required={field.isRequired}
              disabled={readonly}
              className={baseInputClasses}
              aria-describedby={`${field.id}-hint ${hasError ? `${field.id}-error` : ''}`}
              aria-invalid={hasError}
            />
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div>
            <select
              id={field.id}
              value={value}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
              required={field.isRequired}
              disabled={readonly}
              className={baseInputClasses}
              aria-describedby={`${field.id}-hint ${hasError ? `${field.id}-error` : ''}`}
              aria-invalid={hasError}
            >
              <option value="">Choose an option...</option>
              {field.options?.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      handleValueChange(field.id, newValues);
                    }}
                    disabled={readonly}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                      prefersHighContrast ? 'border-gray-800' : ''
                    }`}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'radio':
        return (
          <div>
            <div className="space-y-2" role="radiogroup" aria-labelledby={`${field.id}-label`}>
              {field.options?.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={value === option.value}
                    onChange={(e) => handleValueChange(field.id, e.target.value)}
                    disabled={readonly}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${
                      prefersHighContrast ? 'border-gray-800' : ''
                    }`}
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'checkbox':
      case 'boolean':
        return (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                id={field.id}
                checked={!!value}
                onChange={(e) => handleValueChange(field.id, e.target.checked)}
                disabled={readonly}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  prefersHighContrast ? 'border-gray-800' : ''
                }`}
              />
              <span className="ml-2 text-sm text-gray-700">
                {field.placeholder || `Enable ${field.label}`}
              </span>
            </label>
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'color':
        return (
          <div>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                id={field.id}
                value={value || '#000000'}
                onChange={(e) => handleValueChange(field.id, e.target.value)}
                disabled={readonly}
                className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={value || '#000000'}
                onChange={(e) => handleValueChange(field.id, e.target.value)}
                placeholder="#000000"
                disabled={readonly}
                className={baseInputClasses.replace('w-full', 'flex-1')}
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'rating':
        const maxRating = field.validation?.max || 5;
        const currentRating = parseInt(value) || 0;
        return (
          <div>
            <div className="flex items-center space-x-1">
              {[...Array(maxRating)].map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => !readonly && handleValueChange(field.id, index + 1)}
                  disabled={readonly}
                  className={`w-8 h-8 ${
                    index < currentRating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400 transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                  aria-label={`Rate ${index + 1} out of ${maxRating}`}
                >
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {currentRating}/{maxRating}
              </span>
            </div>
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case 'file':
        return (
          <div>
            <input
              type="file"
              id={field.id}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleValueChange(field.id, {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified
                  });
                }
              }}
              disabled={readonly}
              className={baseInputClasses}
              aria-describedby={`${field.id}-hint ${hasError ? `${field.id}-error` : ''}`}
              aria-invalid={hasError}
            />
            {value && typeof value === 'object' && value.name && (
              <p className="mt-1 text-sm text-gray-600">
                Selected: {value.name} ({(value.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div>
            <input
              type="text"
              id={field.id}
              value={value}
              onChange={(e) => handleValueChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.isRequired}
              disabled={readonly}
              className={baseInputClasses}
              aria-describedby={`${field.id}-hint ${hasError ? `${field.id}-error` : ''}`}
              aria-invalid={hasError}
            />
            {hasError && (
              <p id={`${field.id}-error`} className="mt-1 text-sm text-red-600" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );
    }
  };

  if (mode === 'fill') {
    return (
      <div className="space-y-6">
        {enabledFields.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No custom fields</h3>
            <p className="text-gray-600">No custom fields have been configured for this checklist.</p>
          </div>
        ) : (
          <AnimatePresence>
            {enabledFields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <label
                  htmlFor={field.id}
                  id={`${field.id}-label`}
                  className="block text-sm font-medium text-gray-700"
                >
                  <span className="mr-2">{getFieldTypeIcon(field.type)}</span>
                  {field.label}
                  {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.description && (
                  <p id={`${field.id}-hint`} className="text-sm text-gray-600">
                    {field.description}
                  </p>
                )}
                {renderFieldInput(field)}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    );
  }

  // Design mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Custom Fields</h2>
          <p className="text-sm text-gray-600 mt-1">
            Create custom fields to collect additional information
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Field
        </Button>
      </div>

      {/* Fields List */}
      {fields.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No custom fields</h3>
          <p className="text-gray-600 mb-4">Add custom fields to collect additional information in your checklists.</p>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Your First Field
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {fields.sort((a, b) => a.order - b.order).map((field, index) => (
              <motion.div
                key={field.id}
                initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getFieldTypeIcon(field.type)}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {field.label}
                          {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                          {!field.isEnabled && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Disabled
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {field.type.charAt(0).toUpperCase() + field.type.slice(1)}
                          {field.description && ` • ${field.description}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setEditingField(field)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        onDeleteField(field.id);
                        announce(`Field "${field.label}" deleted`, 'polite');
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Field Modal */}
      {(isCreateModalOpen || editingField) && (
        <CustomFieldModal
          field={editingField}
          onSave={(fieldData) => {
            if (editingField) {
              onUpdateField(editingField.id, fieldData);
              announce(`Field "${fieldData.label}" updated`, 'polite');
            } else {
              onCreateField(fieldData);
              announce(`Field "${fieldData.label}" created`, 'polite');
            }
            setIsCreateModalOpen(false);
            setEditingField(null);
          }}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
};

// Custom Field Modal Component
interface CustomFieldModalProps {
  field?: CustomField | null;
  onSave: (field: Omit<CustomField, 'id' | 'createdAt' | 'lastModified'>) => void;
  onClose: () => void;
}

const CustomFieldModal: React.FC<CustomFieldModalProps> = ({
  field,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: field?.name || '',
    label: field?.label || '',
    type: field?.type || 'text' as CustomFieldType,
    description: field?.description || '',
    isRequired: field?.isRequired || false,
    isEnabled: field?.isEnabled !== false,
    placeholder: field?.placeholder || '',
    defaultValue: field?.defaultValue || '',
    order: field?.order || 0,
    category: field?.category || '',
    options: field?.options || [],
    validation: field?.validation || {}
  });

  const [newOption, setNewOption] = useState({ value: '', label: '' });

  const fieldTypes: { value: CustomFieldType; label: string; description: string }[] = [
    { value: 'text', label: 'Text', description: 'Single line text input' },
    { value: 'textarea', label: 'Textarea', description: 'Multi-line text input' },
    { value: 'number', label: 'Number', description: 'Numeric input' },
    { value: 'email', label: 'Email', description: 'Email address input' },
    { value: 'url', label: 'URL', description: 'Website URL input' },
    { value: 'tel', label: 'Phone', description: 'Phone number input' },
    { value: 'date', label: 'Date', description: 'Date picker' },
    { value: 'datetime', label: 'Date & Time', description: 'Date and time picker' },
    { value: 'time', label: 'Time', description: 'Time picker' },
    { value: 'select', label: 'Dropdown', description: 'Single selection dropdown' },
    { value: 'multiselect', label: 'Multi-select', description: 'Multiple selection checkboxes' },
    { value: 'radio', label: 'Radio Buttons', description: 'Single selection radio buttons' },
    { value: 'checkbox', label: 'Checkbox', description: 'Single checkbox' },
    { value: 'boolean', label: 'Yes/No', description: 'Boolean toggle' },
    { value: 'file', label: 'File Upload', description: 'File attachment' },
    { value: 'color', label: 'Color', description: 'Color picker' },
    { value: 'range', label: 'Range', description: 'Numeric range slider' },
    { value: 'rating', label: 'Rating', description: 'Star rating input' }
  ];

  const requiresOptions = ['select', 'multiselect', 'radio'].includes(formData.type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate name from label if not provided
    const name = formData.name || formData.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    onSave({
      name,
      label: formData.label,
      type: formData.type,
      description: formData.description,
      isRequired: formData.isRequired,
      isEnabled: formData.isEnabled,
      placeholder: formData.placeholder,
      defaultValue: formData.defaultValue,
      order: formData.order,
      category: formData.category,
      options: requiresOptions ? formData.options : undefined,
      validation: formData.validation
    });
  };

  const addOption = () => {
    if (newOption.value && newOption.label) {
      setFormData(prev => ({
        ...prev,
        options: [
          ...prev.options,
          {
            id: Date.now().toString(),
            value: newOption.value,
            label: newOption.label
          }
        ]
      }));
      setNewOption({ value: '', label: '' });
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={field ? 'Edit Custom Field' : 'Create Custom Field'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field-label" className="block text-sm font-medium text-gray-700 mb-2">
              Field Label *
            </label>
            <input
              type="text"
              id="field-label"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="e.g., Project Budget"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="field-name" className="block text-sm font-medium text-gray-700 mb-2">
              Field Name
            </label>
            <input
              type="text"
              id="field-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Auto-generated from label"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Internal name for API access</p>
          </div>
        </div>

        {/* Field Type */}
        <div>
          <label htmlFor="field-type" className="block text-sm font-medium text-gray-700 mb-2">
            Field Type *
          </label>
          <select
            id="field-type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as CustomFieldType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {fieldTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label} - {type.description}
              </option>
            ))}
          </select>
        </div>

        {/* Description and Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="field-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="field-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description or instructions"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="field-placeholder" className="block text-sm font-medium text-gray-700 mb-2">
              Placeholder Text
            </label>
            <input
              type="text"
              id="field-placeholder"
              value={formData.placeholder}
              onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
              placeholder="e.g., Enter amount in USD"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Options for select/radio/multiselect fields */}
        {requiresOptions && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Options *
            </label>
            <div className="space-y-2 mb-4">
              {formData.options.map((option, index) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = { ...option, label: e.target.value };
                      setFormData({ ...formData, options: newOptions });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Option label"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newOption.label}
                onChange={(e) => setNewOption({ ...newOption, label: e.target.value, value: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_') })}
                placeholder="New option label"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={!newOption.label}
              >
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="field-required"
              checked={formData.isRequired}
              onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="field-required" className="ml-2 block text-sm text-gray-700">
              Required field
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="field-enabled"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="field-enabled" className="ml-2 block text-sm text-gray-700">
              Enabled
            </label>
          </div>
          <div>
            <label htmlFor="field-order" className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              id="field-order"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="0"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            {field ? 'Update Field' : 'Create Field'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomFieldManager;

"use client";

import React, { useState } from 'react';
import { ChecklistSection } from '../../types';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface AddSectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (section: Omit<ChecklistSection, 'id'>) => void;
}

const AddSectionForm: React.FC<AddSectionFormProps> = ({
  isOpen,
  onClose,
  onAddSection
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isOptional: false,
    order: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const newSection: Omit<ChecklistSection, 'id'> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      items: [],
      completedCount: 0,
      totalCount: 0,
      isOptional: formData.isOptional,
      order: formData.order,
      estimatedTime: 0,
      actualTime: 0,
      isCollapsed: false
    };

    onAddSection(newSection);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      isOptional: false,
      order: 0
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Custom Section" size="md">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Section Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter the section title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description for this section..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Order */}
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
              Display Order
            </label>
            <input
              type="number"
              id="order"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Lower numbers appear first. Leave at 0 to add at the end.
            </p>
          </div>

          {/* Optional Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isOptional"
              checked={formData.isOptional}
              onChange={(e) => setFormData({ ...formData, isOptional: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isOptional" className="ml-2 block text-sm text-gray-700">
              This section is optional (can be skipped without affecting completion)
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleClose}
              type="button"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              Add Section
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddSectionForm;

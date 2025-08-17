"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PreWorkChecklist, ExportData, ReportTemplate, BrandingConfig } from '../../types';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface PDFExportProps {
  checklist: PreWorkChecklist;
  exportData?: ExportData;
  template?: ReportTemplate;
  onExport?: (format: 'pdf' | 'email' | 'web_link', options: any) => void;
  isLoading?: boolean;
}

const PDFExport: React.FC<PDFExportProps> = ({
  checklist,
  exportData,
  template,
  onExport,
  isLoading = false
}) => {
  const [showModal, setShowModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'email' | 'web_link'>('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeSummary: true,
    includeProgress: true,
    includeItems: true,
    includePhotos: true,
    includeCompliance: true,
    includeSignatures: false,
    includeTimestamps: true,
    includeLocation: true,
    includeNotes: true,
    includeAttachments: true,
    emailRecipients: '',
    emailSubject: `Pre-Work Checklist Report: ${checklist.title}`,
    emailBody: 'Please find the attached pre-work checklist report.',
    pdfOrientation: 'portrait' as 'portrait' | 'landscape',
    pdfSize: 'A4' as 'A4' | 'Letter',
    watermark: '',
    password: '',
    compression: 'medium' as 'low' | 'medium' | 'high'
  });

  const generatePreview = () => {
    const sections = [];
    
    if (exportOptions.includeSummary) {
      sections.push('Project Summary');
    }
    if (exportOptions.includeProgress) {
      sections.push('Progress Overview');
    }
    if (exportOptions.includeItems) {
      sections.push('Checklist Items');
    }
    if (exportOptions.includePhotos) {
      sections.push('Photo Documentation');
    }
    if (exportOptions.includeCompliance) {
      sections.push('Compliance Report');
    }
    if (exportOptions.includeSignatures) {
      sections.push('Signatures & Approvals');
    }
    
    return sections;
  };

  const getEstimatedFileSize = () => {
    let size = 0.5; // Base size in MB
    
    if (exportOptions.includePhotos) {
      const photoCount = checklist.sections.reduce((count, section) => 
        count + section.items.reduce((itemCount, item) => 
          itemCount + (item.attachments?.length || 0), 0), 0);
      size += photoCount * 0.8; // Estimate 0.8MB per photo
    }
    
    if (exportOptions.includeItems) {
      size += checklist.sections.length * 0.1;
    }
    
    return size.toFixed(1);
  };

  const handleExport = () => {
    if (onExport) {
      onExport(exportFormat, {
        ...exportOptions,
        checklist,
        exportData,
        template
      });
    }
  };

  return (
    <div className="pdf-export">
      <Button
        variant="primary"
        onClick={() => setShowModal(true)}
        disabled={isLoading}
        className="flex items-center space-x-2"
      >
        <span>📊</span>
        <span>{isLoading ? 'Generating...' : 'Export Report'}</span>
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Export Checklist Report"
        size="lg"
      >
        <div className="space-y-6">
          {/* Export Format Selection */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Export Format</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'pdf', label: 'PDF Document', icon: '📄', desc: 'Downloadable PDF file' },
                { value: 'email', label: 'Email Report', icon: '📧', desc: 'Send via email' },
                { value: 'web_link', label: 'Web Link', icon: '🔗', desc: 'Shareable web link' }
              ].map((format) => (
                <motion.div
                  key={format.value}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    exportFormat === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setExportFormat(format.value as any)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{format.icon}</div>
                    <div className="font-medium text-sm">{format.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{format.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Options */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Include in Report</h3>
            <div className="space-y-3">
              {[
                { key: 'includeSummary', label: 'Project Summary', desc: 'Title, description, dates, location' },
                { key: 'includeProgress', label: 'Progress Overview', desc: 'Completion statistics and charts' },
                { key: 'includeItems', label: 'Checklist Items', desc: 'All checklist items with status' },
                { key: 'includePhotos', label: 'Photo Documentation', desc: 'Before/after photos and attachments' },
                { key: 'includeCompliance', label: 'Compliance Report', desc: 'Validation checks and issues' },
                { key: 'includeSignatures', label: 'Signatures & Approvals', desc: 'Digital signatures and approvals' },
                { key: 'includeTimestamps', label: 'Timestamps', desc: 'Creation and completion times' },
                { key: 'includeLocation', label: 'Location Data', desc: 'GPS coordinates and address' },
                { key: 'includeNotes', label: 'Notes & Comments', desc: 'Additional notes and observations' },
                { key: 'includeAttachments', label: 'File Attachments', desc: 'Additional files and documents' }
              ].map((option) => (
                <label key={option.key} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions[option.key as keyof typeof exportOptions] as boolean}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      [option.key]: e.target.checked
                    }))}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Format-Specific Options */}
          {exportFormat === 'pdf' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">PDF Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orientation
                  </label>
                  <select
                    value={exportOptions.pdfOrientation}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      pdfOrientation: e.target.value as 'portrait' | 'landscape'
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Page Size
                  </label>
                  <select
                    value={exportOptions.pdfSize}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      pdfSize: e.target.value as 'A4' | 'Letter'
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compression
                  </label>
                  <select
                    value={exportOptions.compression}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      compression: e.target.value as 'low' | 'medium' | 'high'
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="low">Low (Best Quality)</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Smallest Size)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (Optional)
                  </label>
                  <input
                    type="password"
                    value={exportOptions.password}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    placeholder="Protect with password"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Watermark (Optional)
                </label>
                <input
                  type="text"
                  value={exportOptions.watermark}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    watermark: e.target.value
                  }))}
                  placeholder="e.g., CONFIDENTIAL, DRAFT"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {exportFormat === 'email' && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Email Options</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipients (comma-separated)
                  </label>
                  <input
                    type="email"
                    multiple
                    value={exportOptions.emailRecipients}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      emailRecipients: e.target.value
                    }))}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={exportOptions.emailSubject}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      emailSubject: e.target.value
                    }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    value={exportOptions.emailBody}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      emailBody: e.target.value
                    }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Report Preview</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Report Title:</span>
                  <span>{checklist.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Sections:</span>
                  <span>{generatePreview().length} sections</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Format:</span>
                  <span className="capitalize">{exportFormat}</span>
                </div>
                {exportFormat === 'pdf' && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Estimated Size:</span>
                    <span>{getEstimatedFileSize()} MB</span>
                  </div>
                )}
              </div>

              {generatePreview().length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Report will include:
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {generatePreview().map((section, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span>{section}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleExport}
              disabled={isLoading || (exportFormat === 'email' && !exportOptions.emailRecipients)}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <span>
                    {exportFormat === 'pdf' ? '📄' : exportFormat === 'email' ? '📧' : '🔗'}
                  </span>
                  <span>
                    {exportFormat === 'pdf' ? 'Download PDF' : 
                     exportFormat === 'email' ? 'Send Email' : 
                     'Generate Link'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PDFExport;

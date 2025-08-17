"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PreWorkChecklist, ExportData, ReportTemplate, BrandingConfig } from '../../types';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface AdvancedPDFExportProps {
  checklist: PreWorkChecklist;
  exportData?: ExportData;
  onExport?: (format: 'pdf' | 'email' | 'web_link', options: any) => void;
  isLoading?: boolean;
  className?: string;
}

interface ExportOptions {
  // Content options
  includeSummary: boolean;
  includeProgress: boolean;
  includeItems: boolean;
  includePhotos: boolean;
  includeCompliance: boolean;
  includeSignatures: boolean;
  includeTimestamps: boolean;
  includeLocation: boolean;
  includeNotes: boolean;
  includeAttachments: boolean;
  includeAnalytics: boolean;
  
  // PDF specific options
  template: 'professional' | 'minimal' | 'detailed' | 'executive';
  pdfOrientation: 'portrait' | 'landscape';
  pdfSize: 'A4' | 'Letter' | 'Legal';
  quality: 'standard' | 'high' | 'print';
  compression: 'low' | 'medium' | 'high';
  watermark: string;
  password: string;
  
  // Branding options
  includeLogo: boolean;
  logoUrl: string;
  companyName: string;
  primaryColor: string;
  headerColor: string;
  
  // Email options
  emailRecipients: string;
  emailSubject: string;
  emailBody: string;
  emailPriority: 'low' | 'normal' | 'high';
  
  // Analytics options
  includeCharts: boolean;
  chartType: 'bar' | 'pie' | 'line' | 'donut';
  includeTrends: boolean;
  includeComparisons: boolean;
}

const REPORT_TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional Report',
    description: 'Clean, corporate-style report with full branding',
    preview: '📊',
    features: ['Executive Summary', 'Detailed Analytics', 'Professional Layout', 'Custom Branding']
  },
  {
    id: 'minimal',
    name: 'Minimal Report',
    description: 'Simple, clean layout focusing on essential information',
    preview: '📄',
    features: ['Essential Data Only', 'Clean Layout', 'Fast Generation', 'Small File Size']
  },
  {
    id: 'detailed',
    name: 'Detailed Report',
    description: 'Comprehensive report with all available data and insights',
    preview: '📋',
    features: ['Complete Data Set', 'Visual Analytics', 'Compliance Details', 'Audit Trail']
  },
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview designed for management review',
    preview: '👔',
    features: ['Key Metrics Only', 'Executive Summary', 'High-Level Charts', 'Decision Points']
  }
];

const AdvancedPDFExport: React.FC<AdvancedPDFExportProps> = ({
  checklist,
  exportData,
  onExport,
  isLoading = false,
  className = ''
}) => {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'email' | 'web_link'>('pdf');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    // Content options - default to comprehensive
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
    includeAnalytics: true,
    
    // PDF options - professional defaults
    template: 'professional',
    pdfOrientation: 'portrait',
    pdfSize: 'A4',
    quality: 'high',
    compression: 'medium',
    watermark: '',
    password: '',
    
    // Branding options
    includeLogo: true,
    logoUrl: '/logo-placeholder.png',
    companyName: 'Your Company',
    primaryColor: '#2563eb',
    headerColor: '#1e40af',
    
    // Email options
    emailRecipients: '',
    emailSubject: `Pre-Work Checklist Report: ${checklist.title}`,
    emailBody: 'Please find the attached pre-work checklist report with detailed progress and compliance information.',
    emailPriority: 'normal',
    
    // Analytics options
    includeCharts: true,
    chartType: 'bar',
    includeTrends: true,
    includeComparisons: false,
  });

  const steps = [
    { id: 1, title: 'Format & Template', icon: '🎨' },
    { id: 2, title: 'Content Selection', icon: '📋' },
    { id: 3, title: 'Customization', icon: '⚙️' },
    { id: 4, title: 'Review & Export', icon: '🚀' }
  ];

  const calculateFileSize = useCallback(() => {
    let baseSize = 0.5; // MB
    
    if (exportOptions.includePhotos) baseSize += 2.0;
    if (exportOptions.includeAttachments) baseSize += 1.5;
    if (exportOptions.includeAnalytics) baseSize += 0.8;
    if (exportOptions.quality === 'high') baseSize *= 1.5;
    if (exportOptions.quality === 'print') baseSize *= 2;
    if (exportOptions.compression === 'low') baseSize *= 1.8;
    if (exportOptions.compression === 'high') baseSize *= 0.6;
    
    return Math.round(baseSize * 10) / 10;
  }, [exportOptions]);

  const generatePreview = useCallback(() => {
    const sections = [];
    
    if (exportOptions.includeSummary) sections.push('Executive Summary');
    if (exportOptions.includeProgress) sections.push('Progress Overview');
    if (exportOptions.includeAnalytics) sections.push('Analytics Dashboard');
    if (exportOptions.includeItems) sections.push('Detailed Checklist');
    if (exportOptions.includePhotos) sections.push('Photo Documentation');
    if (exportOptions.includeCompliance) sections.push('Compliance Report');
    if (exportOptions.includeTimestamps) sections.push('Timeline & History');
    if (exportOptions.includeLocation) sections.push('Location Data');
    if (exportOptions.includeNotes) sections.push('Notes & Comments');
    if (exportOptions.includeSignatures) sections.push('Signatures & Approvals');
    
    return sections;
  }, [exportOptions]);

  const handleExport = async () => {
    if (onExport) {
      await onExport(exportFormat, exportOptions);
    }
    setShowModal(false);
    setCurrentStep(1);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
            currentStep >= step.id 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'border-gray-300 text-gray-400'
          }`}>
            <span className="text-sm font-medium">
              {currentStep > step.id ? '✓' : step.id}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 h-0.5 mx-2 transition-colors ${
              currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Export Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'pdf', label: 'PDF Document', icon: '📄', desc: 'Professional downloadable report' },
            { value: 'email', label: 'Email Report', icon: '📧', desc: 'Send directly via email' },
            { value: 'web_link', label: 'Web Link', icon: '🔗', desc: 'Shareable online report' }
          ].map((format) => (
            <motion.div
              key={format.value}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                exportFormat === format.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setExportFormat(format.value as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">{format.icon}</div>
                <div className="font-semibold text-gray-900">{format.label}</div>
                <div className="text-sm text-gray-600 mt-1">{format.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {exportFormat === 'pdf' && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Report Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REPORT_TEMPLATES.map((template) => (
              <motion.div
                key={template.id}
                className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  exportOptions.template === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setExportOptions(prev => ({ ...prev, template: template.id as any }))}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{template.preview}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Content to Include</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Content */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Core Content</h4>
          {[
            { key: 'includeSummary', label: 'Executive Summary', desc: 'High-level project overview and key metrics' },
            { key: 'includeProgress', label: 'Progress Analysis', desc: 'Completion statistics and performance metrics' },
            { key: 'includeItems', label: 'Checklist Details', desc: 'Complete list of tasks and their status' },
            { key: 'includeAnalytics', label: 'Analytics Dashboard', desc: 'Charts, graphs, and data visualizations' },
          ].map((option) => (
            <label key={option.key} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  [option.key]: e.target.checked
                }))}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{option.label}</div>
                <div className="text-xs text-gray-600">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Additional Content */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Additional Content</h4>
          {[
            { key: 'includePhotos', label: 'Photo Documentation', desc: 'Before/after photos and media attachments' },
            { key: 'includeCompliance', label: 'Compliance Report', desc: 'Regulatory compliance and validation checks' },
            { key: 'includeTimestamps', label: 'Timeline Data', desc: 'Creation and completion timestamps' },
            { key: 'includeLocation', label: 'Location Information', desc: 'GPS coordinates and address data' },
            { key: 'includeNotes', label: 'Notes & Comments', desc: 'User notes and additional observations' },
            { key: 'includeSignatures', label: 'Digital Signatures', desc: 'Electronic signatures and approvals' },
            { key: 'includeAttachments', label: 'File Attachments', desc: 'Additional documents and files' },
          ].map((option) => (
            <label key={option.key} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  [option.key]: e.target.checked
                }))}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{option.label}</div>
                <div className="text-xs text-gray-600">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your Report</h3>
      
      {exportFormat === 'pdf' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDF Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">PDF Settings</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
                <select
                  value={exportOptions.pdfOrientation}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    pdfOrientation: e.target.value as 'portrait' | 'landscape'
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Page Size</label>
                <select
                  value={exportOptions.pdfSize}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    pdfSize: e.target.value as 'A4' | 'Letter' | 'Legal'
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                <select
                  value={exportOptions.quality}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    quality: e.target.value as 'standard' | 'high' | 'print'
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard</option>
                  <option value="high">High Quality</option>
                  <option value="print">Print Quality</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Compression</label>
                <select
                  value={exportOptions.compression}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    compression: e.target.value as 'low' | 'medium' | 'high'
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low (Best Quality)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Smallest Size)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password Protection (Optional)</label>
              <input
                type="password"
                value={exportOptions.password}
                onChange={(e) => setExportOptions(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter password to protect PDF"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Watermark (Optional)</label>
              <input
                type="text"
                value={exportOptions.watermark}
                onChange={(e) => setExportOptions(prev => ({ ...prev, watermark: e.target.value }))}
                placeholder="e.g., CONFIDENTIAL, DRAFT"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Branding Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Branding</h4>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.includeLogo}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeLogo: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Include Company Logo</span>
            </label>

            {exportOptions.includeLogo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                <input
                  type="url"
                  value={exportOptions.logoUrl}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={exportOptions.companyName}
                onChange={(e) => setExportOptions(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Your Company Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={exportOptions.primaryColor}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={exportOptions.primaryColor}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Header Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={exportOptions.headerColor}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, headerColor: e.target.value }))}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={exportOptions.headerColor}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, headerColor: e.target.value }))}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {exportFormat === 'email' && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Email Settings</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients (comma-separated)</label>
            <input
              type="text"
              value={exportOptions.emailRecipients}
              onChange={(e) => setExportOptions(prev => ({ ...prev, emailRecipients: e.target.value }))}
              placeholder="email1@example.com, email2@example.com"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
            <input
              type="text"
              value={exportOptions.emailSubject}
              onChange={(e) => setExportOptions(prev => ({ ...prev, emailSubject: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
            <textarea
              value={exportOptions.emailBody}
              onChange={(e) => setExportOptions(prev => ({ ...prev, emailBody: e.target.value }))}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={exportOptions.emailPriority}
              onChange={(e) => setExportOptions(prev => ({ ...prev, emailPriority: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      )}

      {exportOptions.includeAnalytics && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 border-b border-gray-200 pb-2">Analytics Options</h4>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportOptions.includeCharts}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeCharts: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Include Charts and Graphs</span>
          </label>

          {exportOptions.includeCharts && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chart Type</label>
              <select
                value={exportOptions.chartType}
                onChange={(e) => setExportOptions(prev => ({ ...prev, chartType: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="line">Line Chart</option>
                <option value="donut">Donut Chart</option>
              </select>
            </div>
          )}

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportOptions.includeTrends}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeTrends: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Include Trend Analysis</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={exportOptions.includeComparisons}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeComparisons: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Include Historical Comparisons</span>
          </label>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Export</h3>
      
      {/* Report Preview */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Report Preview</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Format:</span>
              <span className="text-gray-900 capitalize">{exportFormat}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Template:</span>
              <span className="text-gray-900">
                {REPORT_TEMPLATES.find(t => t.id === exportOptions.template)?.name || 'Default'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Report Title:</span>
              <span className="text-gray-900">{checklist.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">Sections:</span>
              <span className="text-gray-900">{generatePreview().length} sections</span>
            </div>
            {exportFormat === 'pdf' && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Estimated Size:</span>
                  <span className="text-gray-900">{calculateFileSize()} MB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">Page Size:</span>
                  <span className="text-gray-900">{exportOptions.pdfSize} {exportOptions.pdfOrientation}</span>
                </div>
              </>
            )}
          </div>

          <div>
            <h5 className="font-medium text-gray-700 mb-2">Included Sections:</h5>
            <ul className="space-y-1">
              {generatePreview().map((section, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  <span>{section}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {exportFormat === 'email' && exportOptions.emailRecipients && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Email Details:</h5>
            <div className="text-sm text-blue-800">
              <p><strong>To:</strong> {exportOptions.emailRecipients}</p>
              <p><strong>Subject:</strong> {exportOptions.emailSubject}</p>
              <p><strong>Priority:</strong> {exportOptions.emailPriority}</p>
            </div>
          </div>
        )}
      </div>

      {/* Export Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-4">Export Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>✓ Report will be generated using the <strong>{REPORT_TEMPLATES.find(t => t.id === exportOptions.template)?.name}</strong> template</p>
          <p>✓ Content includes {generatePreview().length} sections with comprehensive data</p>
          {exportOptions.includeLogo && (
            <p>✓ Company branding will be applied with your custom colors</p>
          )}
          {exportOptions.password && (
            <p>✓ PDF will be password protected</p>
          )}
          {exportOptions.watermark && (
            <p>✓ Watermark "{exportOptions.watermark}" will be applied</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={className}>
      <Button
        onClick={() => setShowModal(true)}
        disabled={isLoading}
        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
      >
        <span>📊</span>
        <span>{isLoading ? 'Generating...' : 'Advanced Export'}</span>
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setCurrentStep(1);
        }}
        title="Advanced Report Export"
        size="xl"
      >
        <div className="space-y-6">
          {renderStepIndicator()}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <span>{steps[currentStep - 1].icon}</span>
              <span>{steps[currentStep - 1].title}</span>
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              ← Previous
            </Button>
            
            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !exportFormat) ||
                  (currentStep === 2 && generatePreview().length === 0) ||
                  (exportFormat === 'email' && !exportOptions.emailRecipients && currentStep === 4)
                }
              >
                Next →
              </Button>
            ) : (
              <Button
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
                    <span>🚀</span>
                    <span>Export Report</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdvancedPDFExport;

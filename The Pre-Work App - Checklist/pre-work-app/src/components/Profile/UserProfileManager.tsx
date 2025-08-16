"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile } from '../../app/profile/page';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface UserProfileManagerProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onExportProfile: () => void;
  onImportProfile: (file: File) => void;
}

const UserProfileManager: React.FC<UserProfileManagerProps> = ({
  profile,
  onUpdateProfile,
  onExportProfile,
  onImportProfile
}) => {
  const [activeTab, setActiveTab] = useState<keyof UserProfile>('personal');
  const [localProfile, setLocalProfile] = useState<UserProfile>(profile);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const updateProfileField = (category: keyof UserProfile, field: string, value: any) => {
    const newProfile = {
      ...localProfile,
      [category]: {
        ...localProfile[category],
        [field]: value
      }
    };
    setLocalProfile(newProfile);
    setHasUnsavedChanges(true);
  };

  const updateNestedField = (category: keyof UserProfile, parentField: string, field: string, value: any) => {
    const newProfile = {
      ...localProfile,
      [category]: {
        ...localProfile[category],
        [parentField]: {
          ...(localProfile[category] as any)[parentField],
          [field]: value
        }
      }
    };
    setLocalProfile(newProfile);
    setHasUnsavedChanges(true);
  };

  const saveProfile = () => {
    onUpdateProfile(localProfile);
    setHasUnsavedChanges(false);
  };

  const discardChanges = () => {
    setLocalProfile(profile);
    setHasUnsavedChanges(false);
  };

  const tabs = [
    { key: 'personal', label: 'Personal Info', icon: '👤' },
    { key: 'business', label: 'Business Info', icon: '🏢' },
    { key: 'professional', label: 'Professional', icon: '💼' },
    { key: 'preferences', label: 'Preferences', icon: '⚙️' },
    { key: 'social', label: 'Social Links', icon: '🔗' },
    { key: 'account', label: 'Account', icon: '🔐' }
  ] as const;

  const businessTypes = [
    { value: 'contractor', label: 'General Contractor' },
    { value: 'cleaning_service', label: 'Cleaning Service' },
    { value: 'maintenance', label: 'Maintenance & Repair' },
    { value: 'consultant', label: 'Consultant' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {localProfile.personal.avatar ? (
                <img
                  src={localProfile.personal.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {localProfile.personal.firstName.charAt(0) || '?'}
                  {localProfile.personal.lastName.charAt(0) || ''}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowImageModal(true)}
              className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors"
              title="Change profile picture"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {localProfile.personal.firstName || localProfile.personal.lastName 
                ? `${localProfile.personal.firstName} ${localProfile.personal.lastName}`
                : 'Your Profile'
              }
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {localProfile.business.companyName || localProfile.professional.jobTitle || 'Complete your profile to get started'}
            </p>
            <div className="flex items-center mt-2 space-x-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                localProfile.account.verified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {localProfile.account.verified ? '✓ Verified' : 'Unverified'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {localProfile.account.accountType.charAt(0).toUpperCase() + localProfile.account.accountType.slice(1)} Account
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-2 border-transparent'
                }`}
                role="tab"
                aria-selected={activeTab === tab.key}
              >
                <span className="mr-3 text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="mt-8 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExportProfile}
              className="w-full justify-start"
            >
              📤 Export Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) onImportProfile(file);
                };
                input.click();
              }}
              className="w-full justify-start"
            >
              📥 Import Profile
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'personal' && (
                    <PersonalInfoSection
                      profile={localProfile.personal}
                      onUpdate={(field, value) => updateProfileField('personal', field, value)}
                    />
                  )}
                  {activeTab === 'business' && (
                    <BusinessInfoSection
                      profile={localProfile.business}
                      onUpdate={(field, value) => updateProfileField('business', field, value)}
                      onUpdateNested={(parent, field, value) => updateNestedField('business', parent, field, value)}
                      businessTypes={businessTypes}
                    />
                  )}
                  {activeTab === 'professional' && (
                    <ProfessionalInfoSection
                      profile={localProfile.professional}
                      onUpdate={(field, value) => updateProfileField('professional', field, value)}
                      onUpdateNested={(parent, field, value) => updateNestedField('professional', parent, field, value)}
                    />
                  )}
                  {activeTab === 'preferences' && (
                    <PreferencesSection
                      profile={localProfile.preferences}
                      onUpdate={(field, value) => updateProfileField('preferences', field, value)}
                    />
                  )}
                  {activeTab === 'social' && (
                    <SocialLinksSection
                      profile={localProfile.social}
                      onUpdate={(field, value) => updateProfileField('social', field, value)}
                    />
                  )}
                  {activeTab === 'account' && (
                    <AccountSection
                      profile={localProfile.account}
                      onUpdate={(field, value) => updateProfileField('account', field, value)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Save/Discard Actions */}
            {hasUnsavedChanges && (
              <div className="px-6 py-4 bg-yellow-50 border-t border-yellow-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-yellow-800">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    You have unsaved changes
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" size="sm" onClick={discardChanges}>
                      Discard
                    </Button>
                    <Button variant="primary" size="sm" onClick={saveProfile}>
                      Save Profile
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Picture Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Update Profile Picture"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
              {localProfile.personal.avatar ? (
                <img
                  src={localProfile.personal.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl text-gray-400">📷</span>
              )}
            </div>
            <input
              type="url"
              placeholder="Enter image URL..."
              value={localProfile.personal.avatar}
              onChange={(e) => updateProfileField('personal', 'avatar', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-2">
              Enter a URL to your profile picture or upload to an image hosting service
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowImageModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={() => {
                setShowImageModal(false);
                setHasUnsavedChanges(true);
              }}
            >
              Update Picture
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Personal Info Section Component
const PersonalInfoSection: React.FC<{
  profile: UserProfile['personal'];
  onUpdate: (field: string, value: any) => void;
}> = ({ profile, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Basic information about yourself
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          First Name *
        </label>
        <input
          type="text"
          value={profile.firstName}
          onChange={(e) => onUpdate('firstName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter your first name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Last Name *
        </label>
        <input
          type="text"
          value={profile.lastName}
          onChange={(e) => onUpdate('lastName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Enter your last name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={profile.email}
          onChange={(e) => onUpdate('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          value={profile.phone}
          onChange={(e) => onUpdate('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date of Birth
        </label>
        <input
          type="date"
          value={profile.dateOfBirth}
          onChange={(e) => onUpdate('dateOfBirth', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Timezone
        </label>
        <select
          value={profile.timezone}
          onChange={(e) => onUpdate('timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="UTC">UTC</option>
        </select>
      </div>
    </div>
  </div>
);

// Business Info Section Component
const BusinessInfoSection: React.FC<{
  profile: UserProfile['business'];
  onUpdate: (field: string, value: any) => void;
  onUpdateNested: (parent: string, field: string, value: any) => void;
  businessTypes: Array<{ value: string; label: string; }>;
}> = ({ profile, onUpdate, onUpdateNested, businessTypes }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Business Information</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Details about your business or professional practice
      </p>
    </div>

    {/* Basic Business Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Company Name
        </label>
        <input
          type="text"
          value={profile.companyName}
          onChange={(e) => onUpdate('companyName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Your Company Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Business Type
        </label>
        <select
          value={profile.businessType}
          onChange={(e) => onUpdate('businessType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {businessTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Industry
        </label>
        <input
          type="text"
          value={profile.industry}
          onChange={(e) => onUpdate('industry', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="e.g., Residential Cleaning, Commercial Maintenance"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Website
        </label>
        <input
          type="url"
          value={profile.website}
          onChange={(e) => onUpdate('website', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="https://yourwebsite.com"
        />
      </div>
    </div>

    {/* Business Address */}
    <div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Business Address</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Street Address
          </label>
          <input
            type="text"
            value={profile.address.street}
            onChange={(e) => onUpdateNested('address', 'street', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="123 Business St"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City
          </label>
          <input
            type="text"
            value={profile.address.city}
            onChange={(e) => onUpdateNested('address', 'city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            State
          </label>
          <input
            type="text"
            value={profile.address.state}
            onChange={(e) => onUpdateNested('address', 'state', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="State"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ZIP Code
          </label>
          <input
            type="text"
            value={profile.address.zipCode}
            onChange={(e) => onUpdateNested('address', 'zipCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="12345"
          />
        </div>
      </div>
    </div>
  </div>
);

// Professional Info Section Component
const ProfessionalInfoSection: React.FC<{
  profile: UserProfile['professional'];
  onUpdate: (field: string, value: any) => void;
  onUpdateNested: (parent: string, field: string, value: any) => void;
}> = ({ profile, onUpdate, onUpdateNested }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Professional Information</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Your professional experience and service details
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Job Title
        </label>
        <input
          type="text"
          value={profile.jobTitle}
          onChange={(e) => onUpdate('jobTitle', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="e.g., Senior Cleaning Specialist"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Years of Experience
        </label>
        <input
          type="number"
          value={profile.experience}
          onChange={(e) => onUpdate('experience', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          min="0"
          max="50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Hourly Rate ($)
        </label>
        <input
          type="number"
          value={profile.hourlyRate}
          onChange={(e) => onUpdate('hourlyRate', parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          min="0"
          step="0.01"
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Travel Radius (miles)
        </label>
        <input
          type="number"
          value={profile.travelRadius}
          onChange={(e) => onUpdate('travelRadius', parseInt(e.target.value) || 0)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          min="0"
          max="500"
        />
      </div>
    </div>

    <div className="flex items-center">
      <input
        type="checkbox"
        id="emergency-available"
        checked={profile.emergencyAvailable}
        onChange={(e) => onUpdate('emergencyAvailable', e.target.checked)}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor="emergency-available" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
        Available for emergency calls
      </label>
    </div>
  </div>
);

// Preferences Section Component
const PreferencesSection: React.FC<{
  profile: UserProfile['preferences'];
  onUpdate: (field: string, value: any) => void;
}> = ({ profile, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Configure your profile visibility and communication preferences
      </p>
    </div>

    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Profile Visibility
        </label>
        <select
          value={profile.profileVisibility}
          onChange={(e) => onUpdate('profileVisibility', e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="public">Public - Anyone can see your profile</option>
          <option value="clients_only">Clients Only - Only your clients can see details</option>
          <option value="private">Private - Profile hidden from searches</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preferred Communication Method
        </label>
        <select
          value={profile.preferredCommunication}
          onChange={(e) => onUpdate('preferredCommunication', e.target.value)}
          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="text">Text Message</option>
          <option value="app">In-App Messaging</option>
        </select>
      </div>

      <div className="space-y-3">
        {[
          { key: 'showContactInfo', label: 'Show contact information on profile' },
          { key: 'showRates', label: 'Display hourly rates publicly' },
          { key: 'allowDirectBooking', label: 'Allow direct booking without approval' },
          { key: 'receiveNewClientNotifications', label: 'Receive new client notifications' },
          { key: 'receiveJobAlerts', label: 'Receive job alerts in your area' },
          { key: 'autoAcceptReturningClients', label: 'Auto-accept returning clients' }
        ].map((item) => (
          <div key={item.key} className="flex items-center">
            <input
              type="checkbox"
              id={item.key}
              checked={profile[item.key as keyof typeof profile] as boolean}
              onChange={(e) => onUpdate(item.key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={item.key} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              {item.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Social Links Section Component
const SocialLinksSection: React.FC<{
  profile: UserProfile['social'];
  onUpdate: (field: string, value: any) => void;
}> = ({ profile, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Links</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Connect your social media profiles to build trust with clients
      </p>
    </div>

    <div className="space-y-4">
      {[
        { key: 'website', label: 'Website', icon: '🌐', placeholder: 'https://yourwebsite.com' },
        { key: 'linkedin', label: 'LinkedIn', icon: '💼', placeholder: 'https://linkedin.com/in/yourprofile' },
        { key: 'facebook', label: 'Facebook', icon: '📘', placeholder: 'https://facebook.com/yourpage' },
        { key: 'instagram', label: 'Instagram', icon: '📷', placeholder: 'https://instagram.com/youraccount' },
        { key: 'twitter', label: 'Twitter', icon: '🐦', placeholder: 'https://twitter.com/youraccount' },
        { key: 'youtube', label: 'YouTube', icon: '📹', placeholder: 'https://youtube.com/c/yourchannel' }
      ].map((social) => (
        <div key={social.key}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {social.icon} {social.label}
          </label>
          <input
            type="url"
            value={profile[social.key as keyof typeof profile]}
            onChange={(e) => onUpdate(social.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={social.placeholder}
          />
        </div>
      ))}
    </div>
  </div>
);

// Account Section Component
const AccountSection: React.FC<{
  profile: UserProfile['account'];
  onUpdate: (field: string, value: any) => void;
}> = ({ profile, onUpdate }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Account status and security settings
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Account Type
        </label>
        <select
          value={profile.accountType}
          onChange={(e) => onUpdate('accountType', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="free">Free Account</option>
          <option value="pro">Pro Account</option>
          <option value="enterprise">Enterprise Account</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Member Since
        </label>
        <input
          type="text"
          value={new Date(profile.memberSince).toLocaleDateString()}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="verified"
          checked={profile.verified}
          onChange={(e) => onUpdate('verified', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="verified" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Account verified
        </label>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="two-factor"
          checked={profile.twoFactorEnabled}
          onChange={(e) => onUpdate('twoFactorEnabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Two-factor authentication enabled
        </label>
      </div>
    </div>

    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">Account Security</h3>
      <p className="text-sm text-blue-600 dark:text-blue-300">
        Last login: {new Date(profile.lastLoginDate).toLocaleString()}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => {
          // This would typically open a password change modal
          alert('Password change functionality would be implemented here');
        }}
      >
        Change Password
      </Button>
    </div>
  </div>
);

export default UserProfileManager;

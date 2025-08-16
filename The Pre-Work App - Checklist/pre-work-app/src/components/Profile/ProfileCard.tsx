// User profile card component

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile, User } from '../../types/user';
import { USER_ROLES } from '../../utils/constants/roles';

interface ProfileCardProps {
  user: User;
  profile: UserProfile;
  onEdit?: () => void;
  isEditable?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  user,
  profile,
  onEdit,
  isEditable = true
}) => {
  const roleInfo = USER_ROLES[user.role];

  return (
    <motion.div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-white">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-20 h-20 rounded-full border-4 border-white/20 object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-4 border-white/20 bg-white/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
              user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-blue-100 text-sm">{user.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                {roleInfo.name}
              </span>
              {profile.department && (
                <span className="text-blue-100 text-sm">• {profile.department}</span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {isEditable && onEdit && (
            <motion.button
              onClick={onEdit}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            
            {profile.jobTitle && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Job Title</label>
                <p className="text-gray-900">{profile.jobTitle}</p>
              </div>
            )}

            {profile.phoneNumber && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <p className="text-gray-900">{profile.phoneNumber}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Timezone</label>
              <p className="text-gray-900">{profile.timezone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Language</label>
              <p className="text-gray-900">{profile.language.toUpperCase()}</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Role</label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900">{roleInfo.name}</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
              </div>
              <p className="text-sm text-gray-500 mt-1">{roleInfo.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Member Since</label>
              <p className="text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {user.lastLoginAt && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Login</label>
                <p className="text-gray-900">
                  {new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Notification Preferences */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(profile.notifications).map(([key, enabled]) => (
              <div key={key} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

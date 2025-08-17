'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileCard } from '../../components/Profile/ProfileCard';
import { TaskSubmissionForm, SubmissionReview } from '../../components/Submissions/TaskSubmission';
import { User, UserProfile, UserRole } from '../../types/user';
import { TaskSubmission } from '../../types/media';
import { USER_ROLES } from '../../utils/constants/roles';

const ProfileDemo: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [showSubmission, setShowSubmission] = useState(false);
  const [showReview, setShowReview] = useState(false);

  // Mock users for different roles
  const mockUsers: Record<UserRole, { user: User; profile: UserProfile }> = {
    user: {
      user: {
        id: '1',
        email: 'john.doe@company.com',
        role: 'user',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        organizationId: 'org-1',
        managerId: '2'
      },
      profile: {
        id: '1',
        userId: '1',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
        phoneNumber: '+1 (555) 123-4567',
        department: 'Field Operations',
        jobTitle: 'Field Technician',
        bio: 'Experienced field technician specializing in equipment maintenance and safety inspections.',
        timezone: 'America/New_York',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          inApp: true,
          taskUpdates: true,
          approvalRequests: false,
          systemAlerts: true
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      }
    },
    manager: {
      user: {
        id: '2',
        email: 'sarah.smith@company.com',
        role: 'manager',
        status: 'active',
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        organizationId: 'org-1'
      },
      profile: {
        id: '2',
        userId: '2',
        firstName: 'Sarah',
        lastName: 'Smith',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=400&h=400&fit=crop&crop=face',
        phoneNumber: '+1 (555) 234-5678',
        department: 'Operations Management',
        jobTitle: 'Operations Manager',
        bio: 'Team leader with 8+ years experience managing field operations and ensuring quality standards.',
        timezone: 'America/New_York',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          inApp: true,
          taskUpdates: true,
          approvalRequests: true,
          systemAlerts: true
        },
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date()
      }
    },
    supervisor: {
      user: {
        id: '3',
        email: 'mike.johnson@company.com',
        role: 'supervisor',
        status: 'active',
        createdAt: new Date('2022-03-20'),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        organizationId: 'org-1'
      },
      profile: {
        id: '3',
        userId: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        phoneNumber: '+1 (555) 345-6789',
        department: 'Regional Operations',
        jobTitle: 'Regional Supervisor',
        bio: 'Regional supervisor overseeing multiple sites and ensuring compliance across all operations.',
        timezone: 'America/Chicago',
        language: 'en',
        notifications: {
          email: true,
          push: true,
          inApp: true,
          taskUpdates: false,
          approvalRequests: true,
          systemAlerts: true
        },
        createdAt: new Date('2022-03-20'),
        updatedAt: new Date()
      }
    },
    administrator: {
      user: {
        id: '4',
        email: 'admin@company.com',
        role: 'administrator',
        status: 'active',
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        organizationId: 'org-1'
      },
      profile: {
        id: '4',
        userId: '4',
        firstName: 'Alex',
        lastName: 'Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
        phoneNumber: '+1 (555) 456-7890',
        department: 'IT Administration',
        jobTitle: 'System Administrator',
        bio: 'Full-stack administrator managing system infrastructure, user accounts, and security protocols.',
        timezone: 'America/Los_Angeles',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          inApp: true,
          taskUpdates: false,
          approvalRequests: true,
          systemAlerts: true
        },
        createdAt: new Date('2021-01-01'),
        updatedAt: new Date()
      }
    },
    auditor: {
      user: {
        id: '5',
        email: 'auditor@external.com',
        role: 'auditor',
        status: 'active',
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        organizationId: 'external-1'
      },
      profile: {
        id: '5',
        userId: '5',
        firstName: 'Patricia',
        lastName: 'Wilson',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
        phoneNumber: '+1 (555) 567-8901',
        department: 'Compliance & Audit',
        jobTitle: 'External Auditor',
        bio: 'Independent auditor specializing in operational compliance and quality assurance reviews.',
        timezone: 'America/New_York',
        language: 'en',
        notifications: {
          email: true,
          push: false,
          inApp: false,
          taskUpdates: false,
          approvalRequests: false,
          systemAlerts: false
        },
        createdAt: new Date('2024-06-01'),
        updatedAt: new Date()
      }
    }
  };

  // Mock submission for review demo
  const mockSubmission: TaskSubmission = {
    id: 'sub-123',
    taskId: 'task-456',
    checklistId: 'checklist-789',
    submittedBy: '1',
    status: 'under_review',
    mediaFiles: [
      {
        id: 'file-1',
        filename: 'equipment-check.jpg',
        originalName: 'equipment-check.jpg',
        mimeType: 'image/jpeg',
        size: 2048000,
        type: 'image',
        url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300',
        metadata: { width: 1920, height: 1080, checksum: 'abc123' },
        uploadedBy: '1',
        uploadedAt: new Date()
      }
    ],
    notes: 'Equipment inspection completed. All systems operational. Minor cleaning performed on conveyor belt.',
    completedAt: new Date(),
    submittedAt: new Date(),
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null
      })
    }
  };

  const currentUserData = mockUsers[selectedRole];
  const roleInfo = USER_ROLES[selectedRole];

  const handleTaskSubmit = async (submission: Partial<TaskSubmission>) => {
    console.log('Task submitted:', submission);
    alert('Task submitted successfully!');
    setShowSubmission(false);
  };

  const handleApprove = async (notes?: string) => {
    console.log('Submission approved:', notes);
    alert('Submission approved!');
    setShowReview(false);
  };

  const handleReject = async (notes: string) => {
    console.log('Submission rejected:', notes);
    alert('Submission rejected!');
    setShowReview(false);
  };

  const handleRequestChanges = async (notes: string) => {
    console.log('Changes requested:', notes);
    alert('Changes requested!');
    setShowReview(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Multi-Role Profile System Demo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Switch between different user roles to see how the system adapts permissions and capabilities
          </p>

          {/* Role Selector */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {Object.entries(USER_ROLES).map(([role, info]) => (
              <motion.button
                key={role}
                onClick={() => setSelectedRole(role as UserRole)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRole === role
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {info.name}
              </motion.button>
            ))}
          </div>

          {/* Role Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {roleInfo.name} (Level {roleInfo.hierarchy})
            </h3>
            <p className="text-gray-600 mb-4">{roleInfo.description}</p>
            <div className="text-sm text-gray-500">
              <strong>Key Permissions:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {roleInfo.permissions.slice(0, 6).map(permission => (
                  <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {permission}
                  </span>
                ))}
                {roleInfo.permissions.length > 6 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{roleInfo.permissions.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="mb-8">
          <ProfileCard
            user={currentUserData.user}
            profile={currentUserData.profile}
            onEdit={() => alert('Edit profile functionality would open here')}
            isEditable={true}
          />
        </div>

        {/* Role-Based Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Actions for {roleInfo.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Actions */}
            {(selectedRole === 'user' || selectedRole === 'manager' || selectedRole === 'supervisor' || selectedRole === 'administrator') && (
              <motion.button
                onClick={() => setShowSubmission(true)}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Submit Task</h4>
                    <p className="text-sm text-gray-500">Upload evidence and complete tasks</p>
                  </div>
                </div>
              </motion.button>
            )}

            {/* Manager/Supervisor/Admin Actions */}
            {(selectedRole === 'manager' || selectedRole === 'supervisor' || selectedRole === 'administrator') && (
              <motion.button
                onClick={() => setShowReview(true)}
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Review Submissions</h4>
                    <p className="text-sm text-gray-500">Approve or reject task submissions</p>
                  </div>
                </div>
              </motion.button>
            )}

            {/* Admin Actions */}
            {selectedRole === 'administrator' && (
              <motion.button
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('User management panel would open here')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Manage Users</h4>
                    <p className="text-sm text-gray-500">Add, edit, and manage user accounts</p>
                  </div>
                </div>
              </motion.button>
            )}

            {/* Auditor Actions */}
            {selectedRole === 'auditor' && (
              <motion.button
                className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => alert('Audit reports would open here')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">View Reports</h4>
                    <p className="text-sm text-gray-500">Access compliance and audit reports</p>
                  </div>
                </div>
              </motion.button>
            )}
          </div>
        </div>

        {/* Task Submission Modal */}
        <AnimatePresence>
          {showSubmission && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowSubmission(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <TaskSubmissionForm
                  taskId="demo-task"
                  checklistId="demo-checklist"
                  onSubmit={handleTaskSubmit}
                  onCancel={() => setShowSubmission(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submission Review Modal */}
        <AnimatePresence>
          {showReview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowReview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <SubmissionReview
                  submission={mockSubmission}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onRequestChanges={handleRequestChanges}
                />
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowReview(false)}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileDemo;

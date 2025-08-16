'use client';

import React, { useState, useEffect } from 'react';
import UserProfileManager from '../../components/Profile/UserProfileManager';

export interface UserProfile {
  // Personal Information
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
    dateOfBirth: string;
    timezone: string;
    language: string;
  };
  
  // Business Information
  business: {
    companyName: string;
    businessType: 'contractor' | 'cleaning_service' | 'maintenance' | 'consultant' | 'freelancer' | 'other';
    industry: string;
    website: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    licenses: Array<{
      id: string;
      name: string;
      number: string;
      issuingAuthority: string;
      issueDate: string;
      expiryDate: string;
      document?: string;
    }>;
    certifications: Array<{
      id: string;
      name: string;
      issuingOrganization: string;
      issueDate: string;
      expiryDate: string;
      credentialId?: string;
      document?: string;
    }>;
    insurance: {
      generalLiability: {
        provider: string;
        policyNumber: string;
        coverage: number;
        expiryDate: string;
      };
      workersCompensation: {
        provider: string;
        policyNumber: string;
        expiryDate: string;
      };
      bonding: {
        provider: string;
        amount: number;
        expiryDate: string;
      };
    };
  };
  
  // Professional Information
  professional: {
    jobTitle: string;
    experience: number; // years
    specialties: string[];
    serviceAreas: string[];
    availability: {
      monday: { available: boolean; hours: { start: string; end: string; } };
      tuesday: { available: boolean; hours: { start: string; end: string; } };
      wednesday: { available: boolean; hours: { start: string; end: string; } };
      thursday: { available: boolean; hours: { start: string; end: string; } };
      friday: { available: boolean; hours: { start: string; end: string; } };
      saturday: { available: boolean; hours: { start: string; end: string; } };
      sunday: { available: boolean; hours: { start: string; end: string; } };
    };
    hourlyRate: number;
    currency: string;
    emergencyAvailable: boolean;
    travelRadius: number; // miles
  };
  
  // Preferences
  preferences: {
    profileVisibility: 'public' | 'clients_only' | 'private';
    showContactInfo: boolean;
    showRates: boolean;
    allowDirectBooking: boolean;
    receiveNewClientNotifications: boolean;
    receiveJobAlerts: boolean;
    preferredCommunication: 'email' | 'phone' | 'text' | 'app';
    autoAcceptReturningClients: boolean;
  };
  
  // Social Links
  social: {
    linkedin: string;
    facebook: string;
    instagram: string;
    twitter: string;
    website: string;
    youtube: string;
  };
  
  // Reviews and Ratings
  reviews: {
    averageRating: number;
    totalReviews: number;
    recentReviews: Array<{
      id: string;
      clientName: string;
      rating: number;
      comment: string;
      date: string;
      project: string;
    }>;
  };
  
  // Account Settings
  account: {
    memberSince: string;
    accountType: 'free' | 'pro' | 'enterprise';
    verified: boolean;
    backgroundCheckDate?: string;
    twoFactorEnabled: boolean;
    lastLoginDate: string;
  };
}

const defaultProfile: UserProfile = {
  personal: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatar: '',
    dateOfBirth: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en'
  },
  business: {
    companyName: '',
    businessType: 'contractor',
    industry: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    },
    licenses: [],
    certifications: [],
    insurance: {
      generalLiability: {
        provider: '',
        policyNumber: '',
        coverage: 0,
        expiryDate: ''
      },
      workersCompensation: {
        provider: '',
        policyNumber: '',
        expiryDate: ''
      },
      bonding: {
        provider: '',
        amount: 0,
        expiryDate: ''
      }
    }
  },
  professional: {
    jobTitle: '',
    experience: 0,
    specialties: [],
    serviceAreas: [],
    availability: {
      monday: { available: true, hours: { start: '09:00', end: '17:00' } },
      tuesday: { available: true, hours: { start: '09:00', end: '17:00' } },
      wednesday: { available: true, hours: { start: '09:00', end: '17:00' } },
      thursday: { available: true, hours: { start: '09:00', end: '17:00' } },
      friday: { available: true, hours: { start: '09:00', end: '17:00' } },
      saturday: { available: false, hours: { start: '09:00', end: '17:00' } },
      sunday: { available: false, hours: { start: '09:00', end: '17:00' } }
    },
    hourlyRate: 0,
    currency: 'USD',
    emergencyAvailable: false,
    travelRadius: 25
  },
  preferences: {
    profileVisibility: 'clients_only',
    showContactInfo: true,
    showRates: false,
    allowDirectBooking: false,
    receiveNewClientNotifications: true,
    receiveJobAlerts: true,
    preferredCommunication: 'email',
    autoAcceptReturningClients: false
  },
  social: {
    linkedin: '',
    facebook: '',
    instagram: '',
    twitter: '',
    website: '',
    youtube: ''
  },
  reviews: {
    averageRating: 0,
    totalReviews: 0,
    recentReviews: []
  },
  account: {
    memberSince: new Date().toISOString(),
    accountType: 'free',
    verified: false,
    twoFactorEnabled: false,
    lastLoginDate: new Date().toISOString()
  }
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  };

  const handleExportProfile = () => {
    const dataStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.personal.firstName || 'user'}-profile.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportProfile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const importedProfile = JSON.parse(result);
          setProfile(importedProfile);
          localStorage.setItem('userProfile', JSON.stringify(importedProfile));
        }
      } catch (error) {
        console.error('Failed to import profile:', error);
        alert('Failed to import profile. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <UserProfileManager
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExportProfile={handleExportProfile}
            onImportProfile={handleImportProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

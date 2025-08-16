import { NextRequest, NextResponse } from 'next/server';
import { ProfileRepository } from '../../../lib/database/awsRepositories';
import { validateAwsConfig } from '../../../lib/database/config';

export async function GET(request: NextRequest) {
  try {
    validateAwsConfig();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const profileId = searchParams.get('profileId');
    const managerId = searchParams.get('managerId');

    if (userId) {
      const profile = await ProfileRepository.getProfileByUserId(userId);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      return NextResponse.json({ profile });
    }

    if (profileId) {
      const profile = await ProfileRepository.getProfileById(profileId);
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      return NextResponse.json({ profile });
    }

    if (managerId) {
      const teamMembers = await ProfileRepository.getTeamMembers(managerId);
      return NextResponse.json({ teamMembers });
    }

    return NextResponse.json(
      { error: 'Missing required parameter: userId, profileId, or managerId' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in profiles API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    validateAwsConfig();
    
    const body = await request.json();
    const { userId, firstName, lastName, ...profileData } = body;

    if (!userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, firstName, lastName' },
        { status: 400 }
      );
    }

    // Check if profile already exists for this user
    const existingProfile = await ProfileRepository.getProfileByUserId(userId);
    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists for this user' },
        { status: 409 }
      );
    }

    const profile = await ProfileRepository.createProfile({
      userId,
      firstName,
      lastName,
      ...profileData,
    });

    return NextResponse.json({ 
      profile,
      message: 'Profile created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    validateAwsConfig();
    
    const body = await request.json();
    const { userId, updatedBy, ...updates } = body;

    if (!userId || !updatedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, updatedBy' },
        { status: 400 }
      );
    }

    await ProfileRepository.updateProfile(userId, updates);
    
    // Get the updated profile to return it
    const updatedProfile = await ProfileRepository.getProfileByUserId(userId);
    
    return NextResponse.json({ 
      profile: updatedProfile,
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

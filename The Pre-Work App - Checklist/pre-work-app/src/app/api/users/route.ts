import { NextRequest, NextResponse } from 'next/server';
import { UserRepository, ProfileRepository } from '../../../lib/database/awsRepositories';
import { validateAwsConfig } from '../../../lib/database/config';

export async function GET(request: NextRequest) {
  try {
    validateAwsConfig();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const role = searchParams.get('role');

    if (userId) {
      const user = await UserRepository.getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user });
    }

    if (email) {
      const user = await UserRepository.getUserByEmail(email);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ user });
    }

    if (role) {
      const users = await UserRepository.getUsersByRole(role as any);
      return NextResponse.json({ users });
    }

    const users = await UserRepository.getActiveUsers();
    return NextResponse.json({ users });

  } catch (error) {
    console.error('Error in users API:', error);
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
    const { email, username, role, firstName, lastName, ...profileData } = body;

    if (!email || !username || !role || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields: email, username, role, firstName, lastName' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserRepository.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await UserRepository.createUser({
      email,
      username,
      role,
      isActive: true,
    });

    // Create profile
    const profile = await ProfileRepository.createProfile({
      userId: user.userId,
      firstName,
      lastName,
      ...profileData,
    });

    return NextResponse.json({ 
      user, 
      profile,
      message: 'User and profile created successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
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

    await UserRepository.updateUser(userId, updates);
    
    // Get the updated user to return it
    const updatedUser = await UserRepository.getUserById(userId);
    
    return NextResponse.json({ 
      user: updatedUser,
      message: 'User updated successfully' 
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    validateAwsConfig();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const deactivatedBy = searchParams.get('deactivatedBy');

    if (!userId || !deactivatedBy) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, deactivatedBy' },
        { status: 400 }
      );
    }

    await UserRepository.deactivateUser(userId, deactivatedBy);
    
    return NextResponse.json({ 
      message: 'User deactivated successfully' 
    });

  } catch (error) {
    console.error('Error deactivating user:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate user' },
      { status: 500 }
    );
  }
}

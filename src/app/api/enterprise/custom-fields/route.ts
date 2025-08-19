// Custom Fields API
// GET /api/enterprise/custom-fields?workspaceId=xxx - List workspace custom fields
// POST /api/enterprise/custom-fields - Create custom field
// PUT /api/enterprise/custom-fields/[id] - Update custom field
// DELETE /api/enterprise/custom-fields/[id] - Delete custom field

import { NextRequest, NextResponse } from 'next/server';
import { CustomFieldService } from '../../../../services/enterprise';
import { CustomField } from '../../../../types/enterprise';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    const customFields = await CustomFieldService.listWorkspaceCustomFields(workspaceId);
    
    return NextResponse.json({
      success: true,
      data: customFields,
    });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom fields' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      workspaceId, 
      name, 
      type, 
      description, 
      options, 
      defaultValue, 
      isRequired, 
      applicableToTypes 
    } = body;

    if (!workspaceId || !name || !type || !applicableToTypes) {
      return NextResponse.json(
        { error: 'Workspace ID, name, type, and applicable types are required' },
        { status: 400 }
      );
    }

    const customField: CustomField = {
      id: uuidv4(),
      workspaceId,
      name,
      type,
      description,
      options: options || [],
      defaultValue,
      isRequired: isRequired || false,
      isVisible: true,
      order: 0, // Will be calculated based on existing fields
      applicableToTypes,
      validation: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await CustomFieldService.createCustomField(customField);

    return NextResponse.json({
      success: true,
      data: customField,
    });
  } catch (error) {
    console.error('Error creating custom field:', error);
    return NextResponse.json(
      { error: 'Failed to create custom field' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { docClient, TABLES } from '../../../lib/database/config';
import { PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// GET - Fetch user's checklists
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const command = new ScanCommand({
      TableName: TABLES.SUBMISSIONS,
      FilterExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    });

    const result = await docClient.send(command);
    
    return NextResponse.json({ 
      checklists: result.Items || [],
      success: true 
    });

  } catch (error) {
    console.error('Error fetching checklists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checklists', success: false },
      { status: 500 }
    );
  }
}

// POST - Save checklist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, checklistData, title } = body;

    if (!userId || !checklistData) {
      return NextResponse.json(
        { error: 'userId and checklistData are required' },
        { status: 400 }
      );
    }

    const checklistId = uuidv4();
    const timestamp = new Date().toISOString();

    const item = {
      submissionId: checklistId,
      userId,
      title: title || 'Untitled Checklist',
      checklistData,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'draft',
      progress: calculateProgress(checklistData)
    };

    const command = new PutCommand({
      TableName: TABLES.SUBMISSIONS,
      Item: item
    });

    await docClient.send(command);

    return NextResponse.json({
      success: true,
      checklistId,
      message: 'Checklist saved successfully'
    });

  } catch (error) {
    console.error('Error saving checklist:', error);
    return NextResponse.json(
      { error: 'Failed to save checklist', success: false },
      { status: 500 }
    );
  }
}

// Helper function to calculate progress
function calculateProgress(checklistData: any) {
  if (!checklistData?.sections) return 0;
  
  let totalItems = 0;
  let completedItems = 0;

  checklistData.sections.forEach((section: any) => {
    if (section.items) {
      totalItems += section.items.length;
      completedItems += section.items.filter((item: any) => item.completed).length;
    }
  });

  return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
}

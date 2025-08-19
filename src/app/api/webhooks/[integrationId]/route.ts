import { NextRequest, NextResponse } from 'next/server';
import { webhookService } from '../../../../services/integrations/WebhookService';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ integrationId: string }> }
) {
  try {
    const { integrationId } = await params;
    
    // Get headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Get raw body for signature verification
    const rawBody = await request.text();
    
    // Parse body data
    let data: any;
    try {
      data = JSON.parse(rawBody);
    } catch {
      data = rawBody;
    }

    // Extract event type from common webhook patterns
    let event = 'webhook_received';
    if (data.event) event = data.event;
    if (data.type) event = data.type;
    if (data.action) event = data.action;

    // Process webhook
    const result = await webhookService.handleIncomingWebhook(
      integrationId,
      event,
      data,
      headers,
      rawBody
    );

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    const { integrationId } = await params;
    console.error(`Webhook error for ${integrationId}:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification (common with some providers)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ integrationId: string }> }
) {
  const { searchParams } = new URL(request.url);
  const { integrationId } = await params;

  try {
    // Handle verification challenges (like Slack)
    const challenge = searchParams.get('challenge');
    if (challenge) {
      return new Response(challenge, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    // Handle other GET-based webhook patterns
    const event = searchParams.get('event') || 'webhook_ping';
    const data = Object.fromEntries(searchParams.entries());

    const result = await webhookService.handleIncomingWebhook(
      integrationId,
      event,
      data,
      {},
      JSON.stringify(data)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Webhook GET error for ${integrationId}:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

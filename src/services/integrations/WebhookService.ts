import crypto from 'crypto';
import { integrationHub } from './IntegrationHub';

export interface WebhookConfig {
  secret?: string;
  signatureHeader?: string;
  timestampHeader?: string;
  maxAge?: number; // in seconds
}

export interface WebhookValidationResult {
  isValid: boolean;
  error?: string;
  timestamp?: Date;
}

class WebhookService {
  private configs: Map<string, WebhookConfig> = new Map();

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs() {
    // Slack webhook configuration
    this.configs.set('slack', {
      signatureHeader: 'x-slack-signature',
      timestampHeader: 'x-slack-request-timestamp',
      maxAge: 300 // 5 minutes
    });

    // GitHub webhook configuration
    this.configs.set('github', {
      signatureHeader: 'x-hub-signature-256',
      maxAge: 300
    });

    // Zapier webhook configuration
    this.configs.set('zapier', {
      signatureHeader: 'x-zapier-signature',
      maxAge: 300
    });

    // Generic webhook configuration
    this.configs.set('generic', {
      maxAge: 600 // 10 minutes
    });
  }

  async handleIncomingWebhook(
    integrationId: string,
    event: string,
    data: any,
    headers: Record<string, string>,
    rawBody: string
  ): Promise<any> {
    try {
      // Validate webhook authenticity
      const validation = await this.validateWebhook(integrationId, headers, rawBody);
      if (!validation.isValid) {
        throw new Error(`Webhook validation failed: ${validation.error}`);
      }

      // Process webhook through integration hub
      await integrationHub.handleWebhook(integrationId, event, data);

      // Log successful webhook processing
      console.log(`Successfully processed webhook from ${integrationId}:`, {
        event,
        timestamp: new Date().toISOString(),
        dataSize: JSON.stringify(data).length
      });

      return {
        success: true,
        message: 'Webhook processed successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Webhook processing failed for ${integrationId}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async validateWebhook(
    integrationId: string,
    headers: Record<string, string>,
    rawBody: string
  ): Promise<WebhookValidationResult> {
    const config = this.configs.get(integrationId) || this.configs.get('generic')!;
    const integration = integrationHub.getIntegration(integrationId);

    if (!integration || integration.status !== 'connected') {
      return {
        isValid: false,
        error: `Integration ${integrationId} not connected`
      };
    }

    try {
      // Validate timestamp if required
      if (config.timestampHeader) {
        const timestampValidation = this.validateTimestamp(headers, config);
        if (!timestampValidation.isValid) {
          return timestampValidation;
        }
      }

      // Validate signature if required
      if (config.signatureHeader && integration.config.webhookSecret) {
        const signatureValidation = this.validateSignature(
          integrationId,
          headers,
          rawBody,
          integration.config.webhookSecret,
          config
        );
        if (!signatureValidation.isValid) {
          return signatureValidation;
        }
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation error'
      };
    }
  }

  private validateTimestamp(
    headers: Record<string, string>,
    config: WebhookConfig
  ): WebhookValidationResult {
    if (!config.timestampHeader || !config.maxAge) {
      return { isValid: true };
    }

    const timestamp = headers[config.timestampHeader.toLowerCase()];
    if (!timestamp) {
      return {
        isValid: false,
        error: 'Missing timestamp header'
      };
    }

    const webhookTime = new Date(parseInt(timestamp) * 1000);
    const now = new Date();
    const age = (now.getTime() - webhookTime.getTime()) / 1000;

    if (age > config.maxAge) {
      return {
        isValid: false,
        error: 'Webhook timestamp too old'
      };
    }

    return {
      isValid: true,
      timestamp: webhookTime
    };
  }

  private validateSignature(
    integrationId: string,
    headers: Record<string, string>,
    rawBody: string,
    secret: string,
    config: WebhookConfig
  ): WebhookValidationResult {
    if (!config.signatureHeader) {
      return { isValid: true };
    }

    const receivedSignature = headers[config.signatureHeader.toLowerCase()];
    if (!receivedSignature) {
      return {
        isValid: false,
        error: 'Missing signature header'
      };
    }

    let expectedSignature: string;

    switch (integrationId) {
      case 'slack':
        expectedSignature = this.generateSlackSignature(rawBody, secret, headers);
        break;
      case 'github':
        expectedSignature = this.generateGitHubSignature(rawBody, secret);
        break;
      case 'zapier':
        expectedSignature = this.generateZapierSignature(rawBody, secret);
        break;
      default:
        expectedSignature = this.generateGenericSignature(rawBody, secret);
    }

    const isValid = this.safeCompare(receivedSignature, expectedSignature);

    return {
      isValid,
      error: isValid ? undefined : 'Invalid signature'
    };
  }

  private generateSlackSignature(
    rawBody: string,
    secret: string,
    headers: Record<string, string>
  ): string {
    const timestamp = headers['x-slack-request-timestamp'];
    const baseString = `v0:${timestamp}:${rawBody}`;
    const hash = crypto.createHmac('sha256', secret).update(baseString).digest('hex');
    return `v0=${hash}`;
  }

  private generateGitHubSignature(rawBody: string, secret: string): string {
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return `sha256=${hash}`;
  }

  private generateZapierSignature(rawBody: string, secret: string): string {
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return hash;
  }

  private generateGenericSignature(rawBody: string, secret: string): string {
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return hash;
  }

  private safeCompare(received: string, expected: string): boolean {
    if (received.length !== expected.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(received, 'utf8'),
      Buffer.from(expected, 'utf8')
    );
  }

  // Webhook URL generation for integrations
  generateWebhookUrl(integrationId: string, baseUrl: string): string {
    return `${baseUrl}/api/webhooks/${integrationId}`;
  }

  // Register custom webhook configuration
  registerWebhookConfig(integrationId: string, config: WebhookConfig): void {
    this.configs.set(integrationId, config);
  }

  // Get webhook configuration
  getWebhookConfig(integrationId: string): WebhookConfig | undefined {
    return this.configs.get(integrationId);
  }

  // Test webhook endpoint
  async testWebhook(integrationId: string, testData: any): Promise<any> {
    try {
      const result = await this.handleIncomingWebhook(
        integrationId,
        'test',
        testData,
        {},
        JSON.stringify(testData)
      );

      return {
        ...result,
        testMode: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
        testMode: true
      };
    }
  }
}

export const webhookService = new WebhookService();
export default webhookService;

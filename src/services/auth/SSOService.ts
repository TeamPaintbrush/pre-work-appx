import crypto from 'crypto';

export interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oauth2' | 'openid';
  status: 'active' | 'inactive' | 'error';
  config: SSOConfig;
  metadata?: any;
}

export interface SSOConfig {
  // SAML Configuration
  entityId?: string;
  ssoUrl?: string;
  certificate?: string;
  privateKey?: string;
  signatureAlgorithm?: string;
  
  // OAuth2/OpenID Configuration
  clientId?: string;
  clientSecret?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userInfoUrl?: string;
  scope?: string[];
  
  // Common Configuration
  callbackUrl: string;
  attributeMapping: {
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    groups?: string;
  };
}

export interface SSOSession {
  id: string;
  userId: string;
  providerId: string;
  attributes: Record<string, any>;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface SSOLoginRequest {
  providerId: string;
  returnUrl?: string;
  forceAuth?: boolean;
}

export interface SSOLoginResponse {
  success: boolean;
  redirectUrl?: string;
  sessionId?: string;
  error?: string;
}

class SSOService {
  private providers: Map<string, SSOProvider> = new Map();
  private sessions: Map<string, SSOSession> = new Map();
  private pendingRequests: Map<string, SSOLoginRequest> = new Map();

  constructor() {
    this.initializeDefaultProviders();
  }

  private initializeDefaultProviders() {
    // Microsoft Azure AD / Office 365
    this.registerProvider({
      id: 'azure-ad',
      name: 'Microsoft Azure AD',
      type: 'openid',
      status: 'inactive',
      config: {
        callbackUrl: '/api/auth/sso/azure-ad/callback',
        attributeMapping: {
          email: 'email',
          firstName: 'given_name',
          lastName: 'family_name',
          displayName: 'name'
        },
        scope: ['openid', 'profile', 'email']
      }
    });

    // Google Workspace
    this.registerProvider({
      id: 'google-workspace',
      name: 'Google Workspace',
      type: 'openid',
      status: 'inactive',
      config: {
        callbackUrl: '/api/auth/sso/google-workspace/callback',
        attributeMapping: {
          email: 'email',
          firstName: 'given_name',
          lastName: 'family_name',
          displayName: 'name'
        },
        scope: ['openid', 'profile', 'email']
      }
    });

    // Okta
    this.registerProvider({
      id: 'okta',
      name: 'Okta',
      type: 'saml',
      status: 'inactive',
      config: {
        callbackUrl: '/api/auth/sso/okta/callback',
        attributeMapping: {
          email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
          firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
          lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
          displayName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
        }
      }
    });

    // Generic SAML Provider
    this.registerProvider({
      id: 'generic-saml',
      name: 'Generic SAML Provider',
      type: 'saml',
      status: 'inactive',
      config: {
        callbackUrl: '/api/auth/sso/generic-saml/callback',
        attributeMapping: {
          email: 'email',
          firstName: 'firstName',
          lastName: 'lastName',
          displayName: 'displayName'
        }
      }
    });

    // Auth0
    this.registerProvider({
      id: 'auth0',
      name: 'Auth0',
      type: 'openid',
      status: 'inactive',
      config: {
        callbackUrl: '/api/auth/sso/auth0/callback',
        attributeMapping: {
          email: 'email',
          firstName: 'given_name',
          lastName: 'family_name',
          displayName: 'name'
        },
        scope: ['openid', 'profile', 'email']
      }
    });
  }

  registerProvider(provider: SSOProvider): void {
    this.providers.set(provider.id, provider);
  }

  async configureProvider(providerId: string, config: Partial<SSOConfig>): Promise<boolean> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`SSO provider ${providerId} not found`);
    }

    try {
      // Validate configuration
      await this.validateProviderConfig(provider.type, config);
      
      // Update provider configuration
      provider.config = { ...provider.config, ...config };
      provider.status = 'active';
      
      // Generate metadata for SAML providers
      if (provider.type === 'saml') {
        provider.metadata = await this.generateSAMLMetadata(provider);
      }

      return true;
    } catch (error) {
      provider.status = 'error';
      console.error(`Failed to configure SSO provider ${providerId}:`, error);
      throw error;
    }
  }

  private async validateProviderConfig(type: string, config: Partial<SSOConfig>): Promise<void> {
    switch (type) {
      case 'saml':
        if (!config.entityId || !config.ssoUrl) {
          throw new Error('SAML provider requires entityId and ssoUrl');
        }
        break;
      case 'oauth2':
      case 'openid':
        if (!config.clientId || !config.clientSecret || !config.authorizationUrl || !config.tokenUrl) {
          throw new Error('OAuth2/OpenID provider requires clientId, clientSecret, authorizationUrl, and tokenUrl');
        }
        break;
    }
  }

  async initiateLogin(request: SSOLoginRequest): Promise<SSOLoginResponse> {
    const provider = this.providers.get(request.providerId);
    if (!provider) {
      return {
        success: false,
        error: `SSO provider ${request.providerId} not found`
      };
    }

    if (provider.status !== 'active') {
      return {
        success: false,
        error: `SSO provider ${request.providerId} is not active`
      };
    }

    try {
      // Generate state parameter for security
      const state = crypto.randomBytes(32).toString('hex');
      this.pendingRequests.set(state, request);

      let redirectUrl: string;

      switch (provider.type) {
        case 'saml':
          redirectUrl = await this.generateSAMLRequest(provider, state);
          break;
        case 'oauth2':
        case 'openid':
          redirectUrl = this.generateOAuthRequest(provider, state);
          break;
        default:
          throw new Error(`Unsupported SSO provider type: ${provider.type}`);
      }

      return {
        success: true,
        redirectUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login initiation failed'
      };
    }
  }

  private generateOAuthRequest(provider: SSOProvider, state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: provider.config.clientId!,
      redirect_uri: provider.config.callbackUrl,
      scope: provider.config.scope?.join(' ') || 'openid profile email',
      state
    });

    if (provider.type === 'openid') {
      params.set('response_type', 'code');
    }

    return `${provider.config.authorizationUrl}?${params.toString()}`;
  }

  private async generateSAMLRequest(provider: SSOProvider, state: string): Promise<string> {
    // This is a simplified SAML request generation
    // In a production environment, you would use a proper SAML library
    const samlRequest = `<?xml version="1.0" encoding="UTF-8"?>
      <samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                          xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                          ID="_${crypto.randomUUID()}"
                          Version="2.0"
                          ProviderName="PreWork App"
                          IssueInstant="${new Date().toISOString()}"
                          Destination="${provider.config.ssoUrl}"
                          ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                          AssertionConsumerServiceURL="${provider.config.callbackUrl}">
        <saml:Issuer>${provider.config.entityId}</saml:Issuer>
        <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
                           AllowCreate="true"/>
      </samlp:AuthnRequest>`;

    const encodedRequest = Buffer.from(samlRequest).toString('base64');
    const params = new URLSearchParams({
      SAMLRequest: encodedRequest,
      RelayState: state
    });

    return `${provider.config.ssoUrl}?${params.toString()}`;
  }

  async handleCallback(providerId: string, callbackData: any, state: string): Promise<SSOSession | null> {
    const provider = this.providers.get(providerId);
    const request = this.pendingRequests.get(state);

    if (!provider || !request) {
      throw new Error('Invalid SSO callback');
    }

    try {
      let userAttributes: Record<string, any>;

      switch (provider.type) {
        case 'oauth2':
        case 'openid':
          userAttributes = await this.handleOAuthCallback(provider, callbackData);
          break;
        case 'saml':
          userAttributes = await this.handleSAMLCallback(provider, callbackData);
          break;
        default:
          throw new Error(`Unsupported provider type: ${provider.type}`);
      }

      // Create SSO session
      const session = await this.createSession(providerId, userAttributes);
      
      // Clean up pending request
      this.pendingRequests.delete(state);

      return session;
    } catch (error) {
      console.error(`SSO callback failed for provider ${providerId}:`, error);
      this.pendingRequests.delete(state);
      throw error;
    }
  }

  private async handleOAuthCallback(provider: SSOProvider, callbackData: any): Promise<Record<string, any>> {
    const { code } = callbackData;
    
    // Exchange code for token
    const tokenResponse = await fetch(provider.config.tokenUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: provider.config.clientId!,
        client_secret: provider.config.clientSecret!,
        code,
        redirect_uri: provider.config.callbackUrl
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenData.error_description}`);
    }

    // Get user info
    const userResponse = await fetch(provider.config.userInfoUrl!, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    const userData = await userResponse.json();
    
    if (!userResponse.ok) {
      throw new Error('Failed to fetch user information');
    }

    return userData;
  }

  private async handleSAMLCallback(provider: SSOProvider, callbackData: any): Promise<Record<string, any>> {
    // This is a simplified SAML response handling
    // In production, you would use a proper SAML library to validate and parse the response
    const { SAMLResponse } = callbackData;
    
    if (!SAMLResponse) {
      throw new Error('Missing SAML response');
    }

    // Decode and parse SAML response
    const decodedResponse = Buffer.from(SAMLResponse, 'base64').toString('utf8');
    
    // Extract attributes (simplified - in production, use proper XML parsing)
    const attributeRegex = /<saml:Attribute Name="([^"]*)"[^>]*>[\s\S]*?<saml:AttributeValue[^>]*>([^<]*)<\/saml:AttributeValue>/g;
    const attributes: Record<string, any> = {};
    
    let match;
    while ((match = attributeRegex.exec(decodedResponse)) !== null) {
      attributes[match[1]] = match[2];
    }

    return attributes;
  }

  private async createSession(providerId: string, attributes: Record<string, any>): Promise<SSOSession> {
    const provider = this.providers.get(providerId)!;
    const mapping = provider.config.attributeMapping;

    // Map attributes according to provider configuration
    const mappedAttributes = {
      email: attributes[mapping.email],
      firstName: mapping.firstName ? attributes[mapping.firstName] : undefined,
      lastName: mapping.lastName ? attributes[mapping.lastName] : undefined,
      displayName: mapping.displayName ? attributes[mapping.displayName] : undefined,
      groups: mapping.groups ? attributes[mapping.groups] : undefined
    };

    const session: SSOSession = {
      id: crypto.randomUUID(),
      userId: mappedAttributes.email, // Use email as user ID for now
      providerId,
      attributes: mappedAttributes,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      isActive: true
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): SSOSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session && session.expiresAt < new Date()) {
      session.isActive = false;
      return session;
    }
    return session;
  }

  async logout(sessionId: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.sessions.delete(sessionId);
      return true;
    }
    return false;
  }

  getProviders(): SSOProvider[] {
    return Array.from(this.providers.values());
  }

  getActiveProviders(): SSOProvider[] {
    return this.getProviders().filter(provider => provider.status === 'active');
  }

  getProvider(id: string): SSOProvider | undefined {
    return this.providers.get(id);
  }

  private async generateSAMLMetadata(provider: SSOProvider): Promise<string> {
    // Generate SAML metadata for the provider
    return `<?xml version="1.0" encoding="UTF-8"?>
      <md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                           entityID="${provider.config.entityId}">
        <md:SPSSODescriptor AuthnRequestsSigned="false"
                           WantAssertionsSigned="false"
                           protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
          <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                                      Location="${provider.config.callbackUrl}"
                                      index="1"/>
        </md:SPSSODescriptor>
      </md:EntityDescriptor>`;
  }

  async testProvider(providerId: string): Promise<boolean> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    try {
      // Perform basic connectivity test
      if (provider.type === 'oauth2' || provider.type === 'openid') {
        const response = await fetch(provider.config.authorizationUrl!, { method: 'HEAD' });
        return response.status < 400;
      }
      
      if (provider.type === 'saml') {
        const response = await fetch(provider.config.ssoUrl!, { method: 'HEAD' });
        return response.status < 400;
      }

      return false;
    } catch (error) {
      console.error(`Provider test failed for ${providerId}:`, error);
      return false;
    }
  }
}

export const ssoService = new SSOService();
export default ssoService;

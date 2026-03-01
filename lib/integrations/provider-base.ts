/**
 * Base class for all integration providers
 */

import { 
  OAuthConfig, 
  OAuthTokens, 
  SyncResult, 
  IntegrationMetadata,
  SyncOptions,
  WebhookPayload,
  HealthDataConsent 
} from './types';

export abstract class IntegrationProvider {
  abstract readonly metadata: IntegrationMetadata;
  abstract readonly oauthConfig: OAuthConfig;

  protected tokens: Map<string, OAuthTokens> = new Map();

  /**
   * Get OAuth authorization URL
   */
  abstract getAuthUrl(userId: string): Promise<string>;

  /**
   * Exchange authorization code for tokens
   */
  abstract exchangeCode(code: string): Promise<OAuthTokens>;

  /**
   * Initialize provider with tokens
   */
  async initialize(userId: string, tokens: OAuthTokens): Promise<void> {
    this.tokens.set(userId, tokens);
  }

  /**
   * Refresh access token if expired
   */
  abstract refreshTokens(userId: string): Promise<OAuthTokens>;

  /**
   * Perform sync operation
   */
  abstract sync(userId: string, options?: SyncOptions): Promise<SyncResult>;

  /**
   * Disconnect and cleanup
   */
  abstract disconnect(userId: string): Promise<void>;

  /**
   * Handle incoming webhook
   */
  abstract handleWebhook(payload: WebhookPayload): Promise<void>;

  /**
   * Get stored tokens for user
   */
  protected getTokens(userId: string): OAuthTokens | undefined {
    return this.tokens.get(userId);
  }

  /**
   * Check if tokens need refresh
   */
  protected needsRefresh(tokens: OAuthTokens): boolean {
    // Refresh 5 minutes before expiry
    return Date.now() >= (tokens.expiresAt - 5 * 60 * 1000);
  }

  /**
   * Get valid access token (refresh if needed)
   */
  async getValidAccessToken(userId: string): Promise<string> {
    const tokens = this.getTokens(userId);
    
    if (!tokens) {
      throw new Error('No tokens available');
    }

    if (this.needsRefresh(tokens)) {
      const newTokens = await this.refreshTokens(userId);
      this.tokens.set(userId, newTokens);
      return newTokens.accessToken;
    }

    return tokens.accessToken;
  }
}

/**
 * Base class for health data providers
 */
export abstract class HealthProvider extends IntegrationProvider {
  abstract requestHealthConsent(userId: string, dataTypes: string[]): Promise<HealthDataConsent>;
  abstract checkHealthConsent(userId: string): Promise<HealthDataConsent | null>;
  abstract revokeHealthConsent(userId: string): Promise<void>;
}

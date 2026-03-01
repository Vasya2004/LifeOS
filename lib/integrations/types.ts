/**
 * Base types for all integrations
 */

export type IntegrationType = 'google-calendar' | 'apple-health' | 'fitbit' | 'notion' | 'github';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
  authorizationEndpoint: string;
  tokenEndpoint: string;
  revokeEndpoint?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  itemsFailed: number;
  errors: string[];
  lastSyncAt: Date;
}

export interface IntegrationConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  mappings?: Record<string, string>;
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    categories?: string[];
  };
}

export interface IntegrationMetadata {
  id: IntegrationType;
  name: string;
  description: string;
  icon: string;
  category: 'calendar' | 'health' | 'fitness' | 'productivity' | 'developer';
  features: string[];
  requiresOAuth: boolean;
  supportsWebhook: boolean;
  healthDataAccess?: boolean;
}

export interface IntegrationState {
  type: IntegrationType;
  status: IntegrationStatus;
  config: IntegrationConfig;
  tokens?: OAuthTokens;
  lastSyncAt?: Date;
  lastSyncResult?: SyncResult;
  error?: string;
  userId: string;
}

export interface WebhookPayload {
  provider: IntegrationType;
  event: string;
  data: unknown;
  timestamp: Date;
}

export interface HealthDataConsent {
  granted: boolean;
  grantedAt?: Date;
  dataTypes: string[];
  purpose: string;
  expiresAt?: Date;
}

export interface SyncOptions {
  force?: boolean;
  direction?: 'push' | 'pull' | 'bidirectional';
  dateRange?: {
    from: Date;
    to: Date;
  };
}

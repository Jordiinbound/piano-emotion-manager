/**
 * OAuth2 Credentials Validation Test
 * Piano Emotion Manager
 * 
 * Valida que las credenciales de OAuth2 estén configuradas correctamente
 */

import { describe, it, expect } from 'vitest';
import { getGmailAuthUrl } from './services/gmailOAuth';
import { getOutlookAuthUrl } from './services/outlookOAuth';

describe('OAuth2 Credentials', () => {
  it('should have Gmail OAuth2 credentials configured', () => {
    expect(process.env.GOOGLE_CLIENT_ID).toBeDefined();
    expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined();
    expect(process.env.GOOGLE_CLIENT_ID).toContain('apps.googleusercontent.com');
  });

  it('should have Outlook OAuth2 credentials configured', () => {
    expect(process.env.AZURE_CLIENT_ID).toBeDefined();
    expect(process.env.AZURE_CLIENT_SECRET).toBeDefined();
    // Azure Client ID debe ser un GUID
    expect(process.env.AZURE_CLIENT_ID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('should generate valid Gmail authorization URL', () => {
    const authUrl = getGmailAuthUrl('test-state');
    expect(authUrl).toContain('accounts.google.com/o/oauth2/v2/auth');
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain('redirect_uri=');
    expect(authUrl).toContain('scope=');
    expect(authUrl).toContain('state=test-state');
  });

  it('should generate valid Outlook authorization URL', async () => {
    const authUrl = await getOutlookAuthUrl('test-state');
    expect(authUrl).toContain('login.microsoftonline.com');
    expect(authUrl).toContain('client_id=');
    expect(authUrl).toContain('redirect_uri=');
    expect(authUrl).toContain('scope=');
    expect(authUrl).toContain('state=test-state');
  });
});

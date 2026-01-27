import { ConfidentialClientApplication } from '@azure/msal-node';
import nodemailer from 'nodemailer';

const OUTLOOK_CLIENT_ID = process.env.OUTLOOK_OAUTH_CLIENT_ID || '';
const OUTLOOK_CLIENT_SECRET = process.env.OUTLOOK_OAUTH_CLIENT_SECRET || '';
const OUTLOOK_TENANT_ID = process.env.OUTLOOK_OAUTH_TENANT_ID || 'common';
const OUTLOOK_REDIRECT_URI = process.env.OUTLOOK_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/outlook/callback';

const msalConfig = {
  auth: {
    clientId: OUTLOOK_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${OUTLOOK_TENANT_ID}`,
    clientSecret: OUTLOOK_CLIENT_SECRET,
  },
};

const pca = new ConfidentialClientApplication(msalConfig);

/**
 * Genera la URL de autorización de Outlook OAuth2
 */
export function getOutlookAuthUrl(userId: number): string {
  const authCodeUrlParameters = {
    scopes: ['https://outlook.office365.com/SMTP.Send', 'User.Read'],
    redirectUri: OUTLOOK_REDIRECT_URI,
    state: userId.toString(),
  };

  return pca.getAuthCodeUrl(authCodeUrlParameters);
}

/**
 * Intercambia el código de autorización por tokens
 */
export async function exchangeOutlookCode(code: string) {
  const tokenRequest = {
    code,
    scopes: ['https://outlook.office365.com/SMTP.Send', 'User.Read'],
    redirectUri: OUTLOOK_REDIRECT_URI,
  };

  const response = await pca.acquireTokenByCode(tokenRequest);
  return {
    access_token: response?.accessToken,
    refresh_token: response?.refreshToken,
    expiry_date: response?.expiresOn?.getTime(),
  };
}

/**
 * Refresca el access token usando el refresh token
 */
export async function refreshOutlookToken(refreshToken: string) {
  const tokenRequest = {
    refreshToken,
    scopes: ['https://outlook.office365.com/SMTP.Send', 'User.Read'],
  };

  const response = await pca.acquireTokenByRefreshToken(tokenRequest);
  return {
    access_token: response?.accessToken,
    refresh_token: response?.refreshToken,
    expiry_date: response?.expiresOn?.getTime(),
  };
}

/**
 * Crea un transportador de nodemailer con OAuth2 de Outlook
 */
export function createOutlookTransporter(accessToken: string, email: string) {
  return nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      type: 'OAuth2',
      user: email,
      accessToken,
    },
  });
}

/**
 * Obtiene el email del usuario desde Microsoft Graph API
 */
export async function getOutlookUserEmail(accessToken: string): Promise<string> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  return data.mail || data.userPrincipalName || '';
}

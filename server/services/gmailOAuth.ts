import { google } from 'googleapis';
import nodemailer from 'nodemailer';

const GMAIL_CLIENT_ID = process.env.GMAIL_OAUTH_CLIENT_ID || '';
const GMAIL_CLIENT_SECRET = process.env.GMAIL_OAUTH_CLIENT_SECRET || '';
const GMAIL_REDIRECT_URI = process.env.GMAIL_OAUTH_REDIRECT_URI || 'http://localhost:3000/api/auth/gmail/callback';

const oauth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);

/**
 * Genera la URL de autorización de Gmail OAuth2
 */
export function getGmailAuthUrl(userId: number): string {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: userId.toString(), // Pasar userId en el state para identificar al usuario
    prompt: 'consent', // Forzar consentimiento para obtener refresh token
  });
}

/**
 * Intercambia el código de autorización por tokens
 */
export async function exchangeGmailCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Refresca el access token usando el refresh token
 */
export async function refreshGmailToken(refreshToken: string) {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
}

/**
 * Crea un transportador de nodemailer con OAuth2 de Gmail
 */
export function createGmailTransporter(accessToken: string, email: string) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: email,
      accessToken,
    },
  });
}

/**
 * Obtiene el email del usuario desde el access token
 */
export async function getGmailUserEmail(accessToken: string): Promise<string> {
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  });

  const { data } = await oauth2.userinfo.get();
  return data.email || '';
}

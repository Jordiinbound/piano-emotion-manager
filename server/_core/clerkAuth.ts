import { createClerkClient, verifyToken } from '@clerk/backend';
import type { Request } from 'express';
import type { User } from '../../drizzle/schema';
import * as db from '../db';
import { ENV } from './env';

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: ENV.clerkSecretKey,
});

/**
 * Authenticate request using Clerk session token
 * Extracts token from Authorization header or __session cookie
 * Verifies token with Clerk and syncs user to database
 */
export async function authenticateClerkRequest(req: Request): Promise<User> {
  // Extract token from Authorization header or __session cookie
  const authHeader = req.headers.authorization;
  const sessionToken = authHeader?.replace('Bearer ', '') || req.cookies?.__session;

  if (!sessionToken) {
    throw new Error('No session token found');
  }

  try {
    // Verify token with Clerk
    const payload = await verifyToken(sessionToken, {
      secretKey: ENV.clerkSecretKey,
    });

    if (!payload.sub) {
      throw new Error('Invalid token payload');
    }

    const clerkUserId = payload.sub;

    // Get full user info from Clerk
    const clerkUser = await clerk.users.getUser(clerkUserId);

    const email = clerkUser.emailAddresses.find(
      (e: any) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress || null;

    const name = clerkUser.fullName || clerkUser.firstName || null;

    // Sync user to database
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(clerkUserId);

    if (!user) {
      // Create new user in database
      await db.upsertUser({
        openId: clerkUserId,
        name,
        email,
        loginMethod: 'clerk',
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(clerkUserId);
    } else {
      // Update last signed in
      await db.upsertUser({
        openId: clerkUserId,
        lastSignedIn: signedInAt,
      });
    }

    if (!user) {
      throw new Error('Failed to sync user');
    }

    return user;
  } catch (error) {
    console.error('[Clerk Auth] Authentication failed:', error);
    throw new Error('Authentication failed');
  }
}

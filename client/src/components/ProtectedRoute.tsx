import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protect routes by requiring authentication
 * Redirects unauthenticated users to Clerk sign-in page
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

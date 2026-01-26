import { useUser, useClerk } from '@clerk/clerk-react';

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
}

export function useAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const user: User | null = clerkUser
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || null,
        name: clerkUser.fullName || clerkUser.firstName || null,
        imageUrl: clerkUser.imageUrl || null,
      }
    : null;

  const logout = async () => {
    await signOut();
  };

  return {
    user,
    loading: !isLoaded,
    isAuthenticated: isSignedIn || false,
    logout,
  };
}

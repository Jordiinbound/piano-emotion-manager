import { useUser, useClerk } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
}

export function useAuth() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [timedOut, setTimedOut] = useState(false);

  // Timeout de 5 segundos para evitar spinner infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoaded) {
        console.warn('[Clerk] Timeout: Clerk no cargó en 5 segundos');
        setTimedOut(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoaded]);

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
    loading: !isLoaded && !timedOut,
    isAuthenticated: isSignedIn || false,
    logout,
  };
}

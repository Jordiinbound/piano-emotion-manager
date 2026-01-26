import { ClerkProvider as ClerkProviderBase } from '@clerk/clerk-react';
import { ReactNode } from 'react';

interface ClerkProviderProps {
  children: ReactNode;
}

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_live_Y2xlcmsucGlhbm9lbW90aW9uLmNvbSQ';

export function ClerkProvider({ children }: ClerkProviderProps) {
  if (!publishableKey) {
    console.error('[Clerk] No publishable key found');
    return <>{children}</>;
  }

  return (
    <ClerkProviderBase
      publishableKey={publishableKey}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'bg-card',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          formFieldLabel: 'text-foreground',
          formFieldInput: 'bg-background text-foreground border-input',
          footerActionLink: 'text-primary hover:text-primary/80',
        },
      }}
    >
      {children}
    </ClerkProviderBase>
  );
}

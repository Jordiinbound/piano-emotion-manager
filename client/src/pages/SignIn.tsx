import { SignIn as ClerkSignIn } from '@clerk/clerk-react';

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ClerkSignIn 
        signUpUrl="/sign-up"
        afterSignInUrl="/"
      />
    </div>
  );
}

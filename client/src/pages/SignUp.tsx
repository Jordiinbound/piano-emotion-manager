import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

export default function SignUp() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ClerkSignUp 
        signInUrl="/sign-in"
        afterSignUpUrl="/"
      />
    </div>
  );
}

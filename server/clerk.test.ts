import { describe, it, expect } from 'vitest';

describe('Clerk Configuration', () => {
  it('should have CLERK_SECRET_KEY configured', () => {
    expect(process.env.CLERK_SECRET_KEY).toBeDefined();
    expect(process.env.CLERK_SECRET_KEY).toContain('sk_live_');
  });

  it('should have NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY configured', () => {
    expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBeDefined();
    expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toContain('pk_live_');
  });

  it('should have VITE_CLERK_PUBLISHABLE_KEY configured', () => {
    expect(process.env.VITE_CLERK_PUBLISHABLE_KEY).toBeDefined();
    expect(process.env.VITE_CLERK_PUBLISHABLE_KEY).toContain('pk_live_');
  });
});

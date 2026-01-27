import { describe, it, expect } from 'vitest';

describe('Clerk Configuration', () => {
  it('should have CLERK_SECRET_KEY configured', () => {
    expect(process.env.CLERK_SECRET_KEY).toBeDefined();
    // Aceptar claves de desarrollo (sk_test_) o producción (sk_live_)
    expect(process.env.CLERK_SECRET_KEY).toMatch(/^sk_(test|live)_/);
  });

  it('should have NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY configured', () => {
    expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toBeDefined();
    // Aceptar claves de desarrollo (pk_test_) o producción (pk_live_)
    expect(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY).toMatch(/^pk_(test|live)_/);
  });

  it('should have VITE_CLERK_PUBLISHABLE_KEY configured', () => {
    expect(process.env.VITE_CLERK_PUBLISHABLE_KEY).toBeDefined();
    // Aceptar claves de desarrollo (pk_test_) o producción (pk_live_)
    expect(process.env.VITE_CLERK_PUBLISHABLE_KEY).toMatch(/^pk_(test|live)_/);
  });
});

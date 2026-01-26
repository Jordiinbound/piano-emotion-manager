import { describe, it, expect } from "vitest";

describe("Clerk Development Credentials", () => {
  it("should have CLERK_SECRET_KEY configured", () => {
    expect(process.env.CLERK_SECRET_KEY).toBeDefined();
    expect(process.env.CLERK_SECRET_KEY).toMatch(/^sk_test_/);
  });

  it("should have VITE_CLERK_PUBLISHABLE_KEY configured", () => {
    expect(process.env.VITE_CLERK_PUBLISHABLE_KEY).toBeDefined();
    expect(process.env.VITE_CLERK_PUBLISHABLE_KEY).toMatch(/^pk_test_/);
  });

  it("should be using development keys (not production)", () => {
    // Verify we're NOT using production keys
    expect(process.env.CLERK_SECRET_KEY).not.toMatch(/^sk_live_/);
    expect(process.env.VITE_CLERK_PUBLISHABLE_KEY).not.toMatch(/^pk_live_/);
  });
});

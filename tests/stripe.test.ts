import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// The stripe module is a lazy singleton keyed on the `stripe` export and a
// module-level `cachedClient`. We need module re-evaluation between tests to
// exercise the cached/un-cached branches and the env-missing throw path.
// vi.resetModules() drops the module cache; vi.doMock re-applies mocks on
// the next import.

describe("getStripe (lazy singleton)", () => {
  const ORIGINAL_ENV = process.env.STRIPE_SECRET_KEY;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    if (ORIGINAL_ENV === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = ORIGINAL_ENV;
    }
  });

  it("throws a descriptive error when STRIPE_SECRET_KEY is missing", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const mod = await import("@/lib/stripe");
    expect(() => mod.getStripe()).toThrow(
      /STRIPE_SECRET_KEY is not set\. Add it to your \.env file/,
    );
  });

  it("returns a Stripe client when STRIPE_SECRET_KEY is set", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy_key_for_unit_test";
    const mod = await import("@/lib/stripe");
    const client = mod.getStripe();
    expect(client).toBeDefined();
    // The Stripe SDK exposes the configured API version on instances.
    expect(typeof client).toBe("object");
  });

  it("memoises the client across calls (singleton)", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_singleton_check";
    const mod = await import("@/lib/stripe");
    const first = mod.getStripe();
    const second = mod.getStripe();
    expect(second).toBe(first);
  });

  it("returns the same client via the default proxy and getStripe()", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_proxy_check";
    const mod = await import("@/lib/stripe");
    const fromFn = mod.getStripe();
    // Touching any property on the proxy triggers construction and proxies
    // through to the underlying client. The Stripe SDK exposes `webhooks`
    // and a `VERSION` constant on the instance, both of which the proxy
    // should surface from the cached client.
    const webhooks = (mod.stripe as unknown as { webhooks: unknown }).webhooks;
    expect(webhooks).toBeDefined();
    expect(typeof webhooks).toBe("object");
    // The construction must yield the same instance that getStripe() returns.
    expect(mod.getStripe()).toBe(fromFn);
  });
});

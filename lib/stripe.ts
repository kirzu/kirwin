import Stripe from "stripe";

/**
 * Lazily-resolved Stripe SDK singleton.
 *
 * The client is constructed on first access (not at module load time) so
 * that importing this module in environments where `STRIPE_SECRET_KEY`
 * is not populated — for example during `next build` for type-only paths
 * or in test suites that mock `@/lib/stripe` — does not throw.
 *
 * If the secret key is missing at the moment the client is first used,
 * we throw a descriptive error. The check is deferred so the rest of
 * the application can still boot (and lint/typecheck cleanly) without a
 * real Stripe credential in `.env`.
 */

let cachedClient: Stripe | null = null;

function resolveSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to your .env file (see .env.example).",
    );
  }
  return key;
}

/**
 * Returns a memoised Stripe SDK client. The first call reads
 * `STRIPE_SECRET_KEY` from the environment and constructs a client
 * pinned to the SDK's bundled API version. Subsequent calls return the
 * same instance.
 */
export function getStripe(): Stripe {
  if (cachedClient) return cachedClient;
  cachedClient = new Stripe(resolveSecretKey(), {
    apiVersion: Stripe.API_VERSION,
    typescript: true,
    appInfo: {
      name: "kirwin-bodyworks",
      version: "0.1.0",
    },
  });
  return cachedClient;
}

/**
 * Lazy singleton. Tests mock `@/lib/stripe` entirely so the
 * `getStripe()` path is never executed in test environments. At runtime
 * the first access (e.g. `stripe.webhooks.constructEventAsync(...)`)
 * triggers client construction and validates `STRIPE_SECRET_KEY`.
 */
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe();
    const value = (client as unknown as Record<string | symbol, unknown>)[
      prop as string
    ];
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export default stripe;

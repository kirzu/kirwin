import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/stripe/webhook
 *
 * Receives Stripe webhook events and updates the corresponding booking's
 * `paymentStatus` (and on success, `status`) accordingly.
 *
 * Event handling:
 *   - `checkout.session.completed` — mark the booking PAID and CONFIRMED.
 *     The booking is identified by `client_reference_id`, which the
 *     checkout session creation flow sets to the booking id.
 *   - `checkout.session.expired` — mark the booking payment FAILED.
 *
 * Status codes:
 *   - 200 — event processed (including acknowledged unhandled types).
 *   - 400 — missing/invalid signature, missing webhook secret, or
 *           invalid payload that cannot be attributed to a known event.
 *   - 404 — the booking referenced by the event no longer exists.
 *   - 500 — unexpected error (e.g. database failure).
 *
 * Logging policy:
 *   - We log only non-sensitive, non-PII metadata: event id, event type,
 *     booking id when known, and the final outcome.
 *   - We never log the raw request body, the `stripe-signature` header,
 *     or any customer email/name.
 *
 * Configuration:
 *   - `STRIPE_WEBHOOK_SECRET` must be set to the signing secret from the
 *     Stripe dashboard or CLI. Without it the route returns 400 because
 *     we cannot safely verify the signature.
 *
 * Disable Next.js body parsing: Stripe needs the raw bytes to verify the
 * signature. The default `request.text()` returns the raw body, which is
 * what `constructEventAsync` requires.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function badRequest(reason: string): NextResponse {
  return NextResponse.json({ error: reason }, { status: 400 });
}

function serverError(reason: string): NextResponse {
  return NextResponse.json({ error: reason }, { status: 500 });
}

async function handleCheckoutCompleted(
  event: Stripe.Event,
): Promise<NextResponse> {
  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId =
    typeof session.client_reference_id === "string" &&
    session.client_reference_id.length > 0
      ? session.client_reference_id
      : null;

  if (!bookingId) {
    // Log minimally — bookingId is internal, not PII.
    console.warn(
      `[stripe-webhook] checkout.session.completed without client_reference_id; event=${event.id}`,
    );
    return badRequest("missing client_reference_id");
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    console.warn(
      `[stripe-webhook] booking not found for checkout.session.completed; booking=${bookingId} event=${event.id}`,
    );
    return NextResponse.json({ error: "booking not found" }, { status: 404 });
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: "PAID",
      status: "CONFIRMED",
    },
  });

  console.log(
    `[stripe-webhook] checkout.session.completed applied; booking=${bookingId} event=${event.id}`,
  );

  return NextResponse.json({ received: true });
}

async function handleCheckoutExpired(
  event: Stripe.Event,
): Promise<NextResponse> {
  const session = event.data.object as Stripe.Checkout.Session;
  const bookingId =
    typeof session.client_reference_id === "string" &&
    session.client_reference_id.length > 0
      ? session.client_reference_id
      : null;

  if (!bookingId) {
    console.warn(
      `[stripe-webhook] checkout.session.expired without client_reference_id; event=${event.id}`,
    );
    return badRequest("missing client_reference_id");
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    console.warn(
      `[stripe-webhook] booking not found for checkout.session.expired; booking=${bookingId} event=${event.id}`,
    );
    return NextResponse.json({ error: "booking not found" }, { status: 404 });
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: "FAILED",
    },
  });

  console.log(
    `[stripe-webhook] checkout.session.expired applied; booking=${bookingId} event=${event.id}`,
  );

  return NextResponse.json({ received: true });
}

export async function POST(request: Request): Promise<NextResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || webhookSecret.trim().length === 0) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not configured");
    return badRequest("webhook not configured");
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return badRequest("missing signature");
  }

  // Stripe needs the raw bytes for signature verification; do NOT parse
  // the body as JSON before calling `constructEventAsync`.
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.warn(
      `[stripe-webhook] signature verification failed: ${message}`,
    );
    return badRequest("invalid signature");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        return await handleCheckoutCompleted(event);
      case "checkout.session.expired":
        return await handleCheckoutExpired(event);
      default:
        // Acknowledge receipt so Stripe does not retry indefinitely for
        // event types we deliberately ignore.
        console.log(
          `[stripe-webhook] ignoring unhandled event type; type=${event.type} event=${event.id}`,
        );
        return NextResponse.json({ received: true });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    console.error(
      `[stripe-webhook] handler error; type=${event.type} event=${event.id} message=${message}`,
    );
    return serverError("handler failed");
  }
}

#!/usr/bin/env node

/**
 * Webhook Handler for Stripe billing events
 * Handles subscription updates, payment failures, and billing events
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Environment variables validation
const requiredEnvVars = [
  "STRIPE_SECRET_KEY",
  "BILLING_WEBHOOK_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Initialize services
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Handle Stripe webhook events
 */
async function handleStripeWebhook(event) {
  console.log(`Processing webhook event: ${event.type}`);

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCancellation(event.data.object);
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSuccess(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailure(event.data.object);
        break;

      case "customer.subscription.trial_will_end":
        await handleTrialEnding(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { success: true };
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    throw error;
  }
}

/**
 * Handle subscription creation/update
 */
async function handleSubscriptionUpdate(subscription) {
  const { error } = await supabase.from("subscriptions").upsert(
    {
      stripe_subscription_id: subscription.id,
      customer_id: subscription.customer,
      status: subscription.status,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "stripe_subscription_id",
    }
  );

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  console.log(`Subscription ${subscription.id} updated successfully`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancellation(subscription) {
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) {
    throw new Error(`Failed to cancel subscription: ${error.message}`);
  }

  console.log(`Subscription ${subscription.id} canceled successfully`);
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(invoice) {
  // Update subscription status to active
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", invoice.subscription);

  if (error) {
    throw new Error(
      `Failed to update subscription after payment: ${error.message}`
    );
  }

  console.log(`Payment succeeded for subscription ${invoice.subscription}`);
}

/**
 * Handle failed payment
 */
async function handlePaymentFailure(invoice) {
  // Update subscription status to past_due
  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", invoice.subscription);

  if (error) {
    throw new Error(
      `Failed to update subscription after payment failure: ${error.message}`
    );
  }

  console.log(`Payment failed for subscription ${invoice.subscription}`);
}

/**
 * Handle trial ending notification
 */
async function handleTrialEnding(subscription) {
  // Send notification to user about trial ending
  const { data: user, error } = await supabase
    .from("users")
    .select("email, id")
    .eq("stripe_customer_id", subscription.customer)
    .single();

  if (error) {
    console.error(
      `Failed to find user for trial ending notification: ${error.message}`
    );
    return;
  }

  // Here you would typically send an email notification
  console.log(`Trial ending soon for user ${user.id} (${user.email})`);
}

/**
 * Main webhook handler
 */
export async function handler(request) {
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.BILLING_WEBHOOK_SECRET
    );

    // Process the webhook event
    await handleStripeWebhook(event);

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return new Response(`Webhook processing failed: ${error.message}`, {
      status: 400,
    });
  }
}

// For local development/testing
if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const express = require("express");
  const app = express();

  app.use(express.raw({ type: "application/json" }));

  app.post("/webhook", async (req, res) => {
    try {
      const result = await handler({
        headers: {
          get: (name) => req.headers[name.toLowerCase()],
        },
        text: () => Promise.resolve(req.body.toString()),
      });

      res.status(result.status).send(result.body);
    } catch {
      res.status(500).send("Internal server error");
    }
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Webhook handler listening on port ${PORT}`);
  });
}

import { loadStripe } from "@stripe/stripe-js";
import { env } from "@/env";

// Initialize Stripe with the publishable key from environment variables
export const stripePromise = loadStripe(env.VITE_STRIPE_PUBLISHABLE_KEY || "");

// Helper function to get Stripe instance
export const getStripe = async () => {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error(
      "Stripe failed to initialize. Please check your publishable key."
    );
  }
  return stripe;
};

// Helper function to check if Stripe is properly configured
export const isStripeConfigured = () => {
  return !!env.VITE_STRIPE_PUBLISHABLE_KEY;
};

import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildApiUrl, API_ENDPOINTS } from "@/lib/api";
import { stripePromise } from "@/lib/stripe";

interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  apiLimits: {
    requests: string;
    exports: string;
  };
  cta: string;
  ctaVariant: "primary" | "outline";
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Forge",
    features: [
      "Basic thumbnail generation",
      "9-grid positioning",
      "Drag controls",
      "Live preview",
      "Community support",
    ],
    apiLimits: {
      requests: "100/month",
      exports: "10/month",
    },
    cta: "Get Started",
    ctaVariant: "outline",
  },
  {
    name: "Pro",
    price: "$9",
    period: "month",
    description: "For creators and small teams",
    features: [
      "Everything in Free",
      "High-resolution exports",
      "Custom overlay templates",
      "Batch processing",
      "Priority support",
      "API access",
    ],
    apiLimits: {
      requests: "5,000/month",
      exports: "500/month",
    },
    cta: "Start Pro Trial",
    ctaVariant: "primary",
    popular: true,
  },
  {
    name: "Team",
    price: "$39",
    period: "month",
    description: "For growing teams and agencies",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom branding",
      "Advanced analytics",
      "White-label options",
      "Dedicated support",
    ],
    apiLimits: {
      requests: "25,000/month",
      exports: "2,500/month",
    },
    cta: "Start Team Trial",
    ctaVariant: "outline",
  },
];

const faqs = [
  {
    question: "How does billing work?",
    answer:
      "All plans are billed monthly. You can upgrade, downgrade, or cancel at any time. Changes take effect on your next billing cycle.",
  },
  {
    question: "What happens if I exceed my limits?",
    answer:
      "We'll notify you when you're approaching your limits. For overages, we offer flexible top-up options or you can upgrade to a higher tier.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. You'll retain access to paid features until the end of your current billing period.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee for all paid plans. Contact our support team if you're not satisfied.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, we take data security seriously. All data is encrypted in transit and at rest. See our Privacy Policy for more details.",
  },
];

export default function Pricing() {
  const handleCheckout = async (plan: string) => {
    try {
      const response = await fetch(
        buildApiUrl(API_ENDPOINTS.BILLING_CHECKOUT),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plan: plan.toLowerCase(),
            label: "website",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // If response has URL, redirect directly
        if (data.url) {
          window.location.href = data.url;
        }
        // If response has sessionId, use Stripe redirect
        else if (data.sessionId) {
          const stripe = await stripePromise;
          if (stripe) {
            try {
              const result = await stripe.redirectToCheckout({
                sessionId: data.sessionId,
              });
              if (result.error) {
                console.error("Stripe checkout error:", result.error);
              }
            } catch (error) {
              console.error("Stripe checkout error:", error);
            }
          }
        } else {
          console.error("Invalid checkout response");
        }
      } else {
        console.error("Checkout failed:", await response.text());
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <Layout>
      <Container>
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include our core
              thumbnail generation features.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative p-6 space-y-6 ${
                  tier.popular ? "border-forge shadow-lg" : ""
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-forge text-white">
                    Most Popular
                  </Badge>
                )}

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground ml-1">
                      /{tier.period}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">API Limits</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Requests: {tier.apiLimits.requests}</div>
                      <div>Exports: {tier.apiLimits.exports}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Features</h4>
                    <ul className="space-y-2 text-sm">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="w-4 h-4 text-forge mr-2 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  variant={tier.ctaVariant}
                  className="w-full"
                  onClick={() => handleCheckout(tier.name.toLowerCase())}
                >
                  {tier.cta}
                </Button>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="p-6">
                  <h3 className="font-medium mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* Additional Links */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Have more questions?{" "}
              <Link to="/privacy" className="text-forge hover:underline">
                Privacy Policy
              </Link>{" "}
              •{" "}
              <Link to="/terms" className="text-forge hover:underline">
                Terms of Service
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </Layout>
  );
}

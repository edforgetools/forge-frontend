import { Layout } from "@/components/Layout";
import Container from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";

export default function PricingCancel() {
  return (
    <Layout>
      <Container>
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-semibold">Checkout Cancelled</h1>
            <p className="text-lg text-muted-foreground">
              No worries! You can try again anytime.
            </p>
          </div>

          {/* Info Card */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">What happened?</h2>
            <p className="text-muted-foreground">
              Your checkout process was cancelled. This could happen for several
              reasons:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0"></span>
                You decided to change your plan
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0"></span>
                Payment information needs to be updated
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 mr-2 flex-shrink-0"></span>
                You want to review our plans again
              </li>
            </ul>
          </Card>

          {/* Retry Actions */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Ready to try again?</h3>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="primary">
                <a href="/pricing">Choose a Plan</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/">Back to Home</a>
              </Button>
            </div>
          </div>

          {/* Support */}
          <Card className="p-6 text-center space-y-4">
            <h3 className="text-lg font-semibold">Need help?</h3>
            <p className="text-muted-foreground">
              If you're having trouble with checkout or have questions about our
              plans, we're here to help.
            </p>
            <Button asChild variant="outline">
              <a href="mailto:support@forge.com">Contact Support</a>
            </Button>
          </Card>
        </div>
      </Container>
    </Layout>
  );
}

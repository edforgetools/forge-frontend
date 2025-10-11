import { Button } from "@/components/ui/button";
import { RateLimitDisplay } from "@/components/RateLimitDisplay";
import { rateLimitTestScenarios } from "@/lib/rate-limit-test";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Demo component to test rate limiting functionality
 * This can be used during development to test different rate limit states
 */
export function RateLimitDemo() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Rate Limit Demo</CardTitle>
        <CardDescription>
          Test different rate limiting scenarios to see how the UI responds
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current rate limit display */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-2 text-sm">
            Current Rate Limit Status:
          </h3>
          <RateLimitDisplay />
        </div>

        {/* Test buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={() => rateLimitTestScenarios.normal()}
            className="text-xs"
          >
            Normal (8/10)
          </Button>
          <Button
            variant="outline"
            onClick={() => rateLimitTestScenarios.low()}
            className="text-xs"
          >
            Low (2/10)
          </Button>
          <Button
            variant="outline"
            onClick={() => rateLimitTestScenarios.zero()}
            className="text-xs"
          >
            Zero (0/10)
          </Button>
          <Button
            variant="outline"
            onClick={() => rateLimitTestScenarios.resetSoon()}
            className="text-xs"
          >
            Reset Soon (3/10)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Click the buttons above to simulate different rate limit states and
          see how the UI updates.
        </div>
      </CardContent>
    </Card>
  );
}

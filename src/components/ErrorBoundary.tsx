import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Page } from "@/components/ui/page";
import { Container } from "@/components/ui/container";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Page>
          <Container>
            <Card>
              <CardHeader>
                <div className="mx-auto mb-4 w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-2xl font-bold text-center">
                  Something went wrong
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-center">
                  We're sorry, but something unexpected happened. Please try
                  again or go back to the home page.
                </p>

                {import.meta.env.DEV && this.state.error && (
                  <details className="mt-4 p-3 bg-muted rounded-md">
                    <summary className="cursor-pointer text-sm font-medium">
                      Error Details (Development)
                    </summary>
                    <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-32">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    onClick={this.handleGoHome}
                    className="flex-1"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Container>
        </Page>
      );
    }

    return this.props.children;
  }
}

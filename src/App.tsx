import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { EditorSkeleton } from "./components/EditorSkeleton";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useDocumentTitle } from "./hooks/useDocumentTitle";
import Page from "./components/layout/Page";
import Container from "./components/layout/Container";

// Lazy load pages for better performance
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AppPage = lazy(() => import("./pages/App.tsx"));
const Editor = lazy(() => import("./pages/Editor.tsx"));
const WireGenerateDemo = lazy(() => import("./pages/WireGenerateDemo.tsx"));
const Terms = lazy(() => import("./pages/terms.tsx"));
const Privacy = lazy(() => import("./pages/privacy.tsx"));
const About = lazy(() => import("./pages/about.tsx"));
const Docs = lazy(() => import("./pages/Docs.tsx"));
const Api = lazy(() => import("./pages/Api.tsx"));
const Pricing = lazy(() => import("./pages/Pricing.tsx"));
const PricingSuccess = lazy(() => import("./pages/PricingSuccess.tsx"));
const PricingCancel = lazy(() => import("./pages/PricingCancel.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const LoadingFallback = ({
  label = "Loading application",
}: {
  label?: string;
}) => (
  <Page>
    <Container>
      <div className="text-center" role="status" aria-label={label}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </Container>
  </Page>
);

export default function App() {
  useDocumentTitle();

  return (
    <ErrorBoundary>
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Landing />
            </Suspense>
          }
        />
        <Route
          path="/app"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AppPage />
            </Suspense>
          }
        />
        <Route
          path="/editor"
          element={
            <Suspense fallback={<EditorSkeleton />}>
              <Editor />
            </Suspense>
          }
        />
        <Route
          path="/wire-generate-demo"
          element={
            <Suspense
              fallback={<LoadingFallback label="Loading wire generate demo" />}
            >
              <WireGenerateDemo />
            </Suspense>
          }
        />
        <Route
          path="/terms"
          element={
            <Suspense fallback={<LoadingFallback label="Loading terms page" />}>
              <Terms />
            </Suspense>
          }
        />
        <Route
          path="/privacy"
          element={
            <Suspense
              fallback={<LoadingFallback label="Loading privacy page" />}
            >
              <Privacy />
            </Suspense>
          }
        />
        <Route
          path="/about"
          element={
            <Suspense fallback={<LoadingFallback label="Loading about page" />}>
              <About />
            </Suspense>
          }
        />
        <Route
          path="/docs"
          element={
            <Suspense
              fallback={<LoadingFallback label="Loading documentation" />}
            >
              <Docs />
            </Suspense>
          }
        />
        <Route
          path="/api"
          element={
            <Suspense
              fallback={<LoadingFallback label="Loading API documentation" />}
            >
              <Api />
            </Suspense>
          }
        />
        <Route
          path="/pricing"
          element={
            <Suspense fallback={<LoadingFallback label="Loading pricing" />}>
              <Pricing />
            </Suspense>
          }
        />
        <Route
          path="/pricing/success"
          element={
            <Suspense
              fallback={<LoadingFallback label="Loading success page" />}
            >
              <PricingSuccess />
            </Suspense>
          }
        />
        <Route
          path="/pricing/cancel"
          element={
            <Suspense
              fallback={<LoadingFallback label="Loading cancel page" />}
            >
              <PricingCancel />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingFallback label="Loading page" />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

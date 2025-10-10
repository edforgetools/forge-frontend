import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Header } from "./components/Header";
import { EditorSkeleton } from "./components/EditorSkeleton";
import { ForgeVersionBanner } from "./components/ForgeVersionBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home.tsx"));
const Editor = lazy(() => import("./pages/Editor.tsx"));
const WireGenerateDemo = lazy(() => import("./pages/WireGenerateDemo.tsx"));
const Terms = lazy(() => import("./pages/terms.tsx"));
const Privacy = lazy(() => import("./pages/privacy.tsx"));
const About = lazy(() => import("./pages/about.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const LoadingFallback = ({
  label = "Loading application",
}: {
  label?: string;
}) => (
  <div
    className="h-[100dvh] bg-background flex items-center justify-center"
    role="status"
    aria-label={label}
  >
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <ForgeVersionBanner />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<LoadingFallback />}>
                  <Home />
                </Suspense>
              }
            />
            <Route
              path="/app"
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
                  fallback={
                    <LoadingFallback label="Loading wire generate demo" />
                  }
                >
                  <WireGenerateDemo />
                </Suspense>
              }
            />
            <Route
              path="/terms"
              element={
                <Suspense
                  fallback={<LoadingFallback label="Loading terms page" />}
                >
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
                <Suspense
                  fallback={<LoadingFallback label="Loading about page" />}
                >
                  <About />
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
        </main>
        <footer className="bg-white border-t border-gray-200 py-3 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <p className="text-sm text-gray-500">
              Powered by Forge Layer v
              {import.meta.env.VITE_APP_VERSION || "0.1.0"}
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Header } from "./components/Header";
import { EditorSkeleton } from "./components/EditorSkeleton";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home.tsx"));
const Editor = lazy(() => import("./pages/Editor.tsx"));
const Terms = lazy(() => import("./pages/terms.tsx"));
const Privacy = lazy(() => import("./pages/privacy.tsx"));
const About = lazy(() => import("./pages/about.tsx"));

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
    <div className="min-h-screen bg-background">
      <Header />
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
        </Routes>
      </main>
    </div>
  );
}

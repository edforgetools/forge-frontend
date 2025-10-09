import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { EditorSkeleton } from "./components/EditorSkeleton";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home.tsx"));
const Editor = lazy(() => import("./pages/Editor.tsx"));
const Terms = lazy(() => import("./pages/terms.tsx"));
const Privacy = lazy(() => import("./pages/privacy.tsx"));
const About = lazy(() => import("./pages/about.tsx"));

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense
            fallback={
              <div
                className="h-[100dvh] bg-gray-50 flex items-center justify-center"
                role="status"
                aria-label="Loading application"
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            }
          >
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
            fallback={
              <div
                className="h-[100dvh] bg-gray-50 flex items-center justify-center"
                role="status"
                aria-label="Loading page"
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            }
          >
            <Terms />
          </Suspense>
        }
      />
      <Route
        path="/privacy"
        element={
          <Suspense
            fallback={
              <div
                className="h-[100dvh] bg-gray-50 flex items-center justify-center"
                role="status"
                aria-label="Loading page"
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            }
          >
            <Privacy />
          </Suspense>
        }
      />
      <Route
        path="/about"
        element={
          <Suspense
            fallback={
              <div
                className="h-[100dvh] bg-gray-50 flex items-center justify-center"
                role="status"
                aria-label="Loading page"
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            }
          >
            <About />
          </Suspense>
        }
      />
    </Routes>
  );
}

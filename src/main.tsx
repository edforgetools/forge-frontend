import React, { Suspense, lazy, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import IndexPageStatic from "./pages/index-static";
import { EditorSkeleton } from "./components/EditorSkeleton";
import "./styles/globals.css";

// Lazy load non-critical pages and components
const IndexPage = lazy(() => import("./pages/index"));
const TermsPage = lazy(() => import("./pages/terms"));
const PrivacyPage = lazy(() => import("./pages/privacy"));
const AboutPage = lazy(() => import("./pages/about"));
const AppPage = lazy(() => import("./pages/app"));
const Toaster = lazy(() =>
  import("@/lib/ui/toaster").then((m) => ({ default: m.Toaster }))
);
const Analytics = lazy(() =>
  import("@vercel/analytics/react").then((m) => ({ default: m.Analytics }))
);

// AppPage is already declared above

// Register service worker for caching
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Simple routing without react-router-dom for now
function App() {
  const [currentPage, setCurrentPage] = useState<
    "index" | "app" | "terms" | "privacy" | "about"
  >("index");
  const [useAnimatedIndex, setUseAnimatedIndex] = useState(false);

  // Handle URL-based routing
  useEffect(() => {
    const path = window.location.pathname;
    if (path === "/terms") {
      setCurrentPage("terms");
    } else if (path === "/privacy") {
      setCurrentPage("privacy");
    } else if (path === "/about") {
      setCurrentPage("about");
    } else if (path === "/app") {
      setCurrentPage("app");
    } else {
      setCurrentPage("index");
    }
  }, []);

  // Upgrade to animated version after initial load
  useEffect(() => {
    if (currentPage === "index") {
      const timer = setTimeout(() => {
        setUseAnimatedIndex(true);
      }, 100); // Small delay to ensure static version renders first
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  // Update URL when page changes
  const navigateTo = (page: typeof currentPage) => {
    setCurrentPage(page);
    const path = page === "index" ? "/" : `/${page}`;
    window.history.pushState({}, "", path);
  };

  if (currentPage === "app") {
    return (
      <Suspense fallback={<EditorSkeleton />}>
        <AppPage onBack={() => navigateTo("index")} />
      </Suspense>
    );
  }

  if (currentPage === "terms") {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <TermsPage onBack={() => navigateTo("index")} />
      </Suspense>
    );
  }

  if (currentPage === "privacy") {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <PrivacyPage onBack={() => navigateTo("index")} />
      </Suspense>
    );
  }

  if (currentPage === "about") {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <AboutPage onBack={() => navigateTo("index")} />
      </Suspense>
    );
  }

  // Use static version initially for faster FCP, then upgrade to animated
  if (currentPage === "index") {
    if (useAnimatedIndex) {
      return (
        <Suspense
          fallback={<IndexPageStatic onStart={() => navigateTo("app")} />}
        >
          <IndexPage onStart={() => navigateTo("app")} />
        </Suspense>
      );
    }
    return <IndexPageStatic onStart={() => navigateTo("app")} />;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Suspense fallback={null}>
      <Toaster />
    </Suspense>
    {/* Only load analytics in production */}
    {process.env.NODE_ENV === "production" && (
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
    )}
  </React.StrictMode>
);

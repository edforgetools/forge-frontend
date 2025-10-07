import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import IndexPage from "./pages/index";
import TermsPage from "./pages/terms";
import PrivacyPage from "./pages/privacy";
import AboutPage from "./pages/about";
import { EditorSkeleton } from "./components/EditorSkeleton";
import "./styles/globals.css";
import { Toaster } from "@/lib/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

// Lazy load the Editor (AppPage) to reduce initial bundle size
const AppPage = lazy(() => import("./pages/app"));

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
  const [currentPage, setCurrentPage] = React.useState<
    "index" | "app" | "terms" | "privacy" | "about"
  >("index");

  // Handle URL-based routing
  React.useEffect(() => {
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
    return <TermsPage onBack={() => navigateTo("index")} />;
  }

  if (currentPage === "privacy") {
    return <PrivacyPage onBack={() => navigateTo("index")} />;
  }

  if (currentPage === "about") {
    return <AboutPage onBack={() => navigateTo("index")} />;
  }

  return <IndexPage onStart={() => navigateTo("app")} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster />
    <Analytics />
  </React.StrictMode>
);

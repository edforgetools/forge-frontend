import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";
import "./styles/layers.css";
import {
  runPortalRootValidation,
  enableDevelopmentValidation,
} from "./lib/sanity";
import { computeScrollbarWidth, ensurePortalRoot } from "./lib/dom";

// Lazy load non-critical components
const Toaster = lazy(() =>
  import("@/lib/ui/toaster").then((m) => ({ default: m.Toaster }))
);
const Analytics = lazy(() =>
  import("@vercel/analytics/react").then((m) => ({ default: m.Analytics }))
);

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

// Run portal/root validation at boot
runPortalRootValidation();

// Enable development validation for hot reloading scenarios
enableDevelopmentValidation();

// Compute scrollbar width on load
computeScrollbarWidth();

// Ensure portal root exists (fallback for missing portal-root)
ensurePortalRoot();

const root = ReactDOM.createRoot(document.getElementById("root")!);
const node = (
  <BrowserRouter>
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
  </BrowserRouter>
);

root.render(
  process.env.NODE_ENV === "development" ? (
    <React.StrictMode>{node}</React.StrictMode>
  ) : (
    node
  )
);

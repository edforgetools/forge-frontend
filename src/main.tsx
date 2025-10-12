import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/globals.css";
import "./styles/layers.css";
import "./styles/tokens.css";
// Portal validation removed - portal-root exists in index.html
import { computeScrollbarWidth, ensurePortalRoot } from "./lib/dom";
import { optimizeCriticalRenderingPath } from "./lib/performance";

// Lazy load non-critical components
const Analytics = lazy(() =>
  import("@vercel/analytics/react").then((m) => ({ default: m.Analytics }))
);

// Register service worker for caching (disabled in development)
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {})
      .catch(() => {});
  });
}

// Portal validation removed - portal-root exists in index.html

// Compute scrollbar width on load
computeScrollbarWidth();

// Ensure portal root exists (fallback for missing portal-root)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ensurePortalRoot);
} else {
  ensurePortalRoot();
}

// Optimize critical rendering path for better LCP
optimizeCriticalRenderingPath();

// Compile-time guard: ensure root element exists
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error(
    "Critical error: #root element not found in DOM. Cannot mount React application."
  );
}

const root = ReactDOM.createRoot(rootElement);
const node = (
  <BrowserRouter>
    <App />
    {/* Only load analytics in production */}
    {import.meta.env.PROD && (
      <Suspense fallback={null}>
        <Analytics />
      </Suspense>
    )}
  </BrowserRouter>
);

root.render(
  import.meta.env.DEV ? <React.StrictMode>{node}</React.StrictMode> : node
);

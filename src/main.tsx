// forge-frontend/src/main.tsx
// TEMP: QA visibility
// eslint-disable-next-line no-console
console.log("API Base URL:", import.meta.env.VITE_API_BASE);

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// global client error logging
import { logEvent } from "./lib/logEvent";

window.addEventListener("error", (ev) =>
  logEvent("global_error", {
    message: ev.error?.message ?? ev.message,
    stack: ev.error?.stack,
    filename: ev.filename,
    lineno: ev.lineno,
    colno: ev.colno,
  })
);
window.addEventListener("unhandledrejection", (ev) =>
  logEvent("unhandled_rejection", {
    reason: (ev as any).reason?.toString(),
    stack: (ev as any).reason?.stack,
  })
);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

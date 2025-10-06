import React from "react";
import ReactDOM from "react-dom/client";
import IndexPage from "./pages/index";
import AppPage from "./pages/app";
import "./styles/globals.css";

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
  const [currentPage, setCurrentPage] = React.useState<"index" | "app">(
    "index"
  );

  if (currentPage === "app") {
    return <AppPage onBack={() => setCurrentPage("index")} />;
  }

  return <IndexPage onStart={() => setCurrentPage("app")} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

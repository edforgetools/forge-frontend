import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
  "/": "Forge Tools",
  "/app": "Snapthumb • Forge",
  "/docs": "Snapthumb Help • Forge",
  "/api": "API • Forge",
  "/privacy": "Privacy • Forge",
};

export function useDocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    const title = routeTitles[location.pathname] || "Forge Tools";
    document.title = title;
  }, [location.pathname]);
}

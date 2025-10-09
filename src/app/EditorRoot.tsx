import React, { useRef, useEffect } from "react";

interface EditorRootProps {
  children: React.ReactNode;
}

export function EditorRoot({ children }: EditorRootProps) {
  const initializedRef = useRef(false);

  useEffect(() => {
    // Check if this is a second mount attempt
    if (initializedRef.current && process.env.NODE_ENV === "development") {
      console.warn(
        "EditorRoot: Second mount detected! EditorRoot should only be mounted once. " +
          "This may indicate duplicate provider setup."
      );
    }

    // Mark as initialized
    initializedRef.current = true;

    // Cleanup function to reset the flag when unmounted
    return () => {
      initializedRef.current = false;
    };
  }, []);

  return <>{children}</>;
}

export default EditorRoot;

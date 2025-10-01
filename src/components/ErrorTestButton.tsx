import React, { useState } from "react";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface ErrorTestButtonProps {
  onError?: (error: Error) => void;
}

export default function ErrorTestButton({ onError }: ErrorTestButtonProps) {
  const [shouldError, setShouldError] = useState(false);

  // This will cause a React error when shouldError is true
  if (shouldError) {
    throw new Error("Test error triggered by ErrorTestButton");
  }

  const triggerError = () => {
    setShouldError(true);
    if (onError) {
      onError(new Error("Test error triggered"));
    }
  };

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={triggerError}
      className="flex items-center gap-2"
    >
      <AlertTriangle className="h-4 w-4" />
      Test Error Boundary
    </Button>
  );
}

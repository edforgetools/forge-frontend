import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { sessionDB } from "@/lib/db";
import { ApiKeyManager } from "@/components/ApiKeyManager";
import { useRateLimitStore } from "@/state/rateLimitStore";

interface SettingsProps {
  onClearSession?: () => void;
}

export function Settings({ onClearSession }: SettingsProps) {
  const [isSessionRestoreEnabled, setIsSessionRestoreEnabled] = useState(true);
  const { updateTier } = useRateLimitStore();

  useEffect(() => {
    // Initialize the enabled state
    setIsSessionRestoreEnabled(sessionDB.isSessionRestoreEnabled());
    // Update tier on mount
    updateTier();
  }, [updateTier]);

  const handleToggleSessionRestore = () => {
    const newEnabled = !isSessionRestoreEnabled;
    setIsSessionRestoreEnabled(newEnabled);
    sessionDB.setEnabled(newEnabled);
  };

  const handleClearSession = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear all saved session data? This cannot be undone."
      )
    ) {
      await sessionDB.clearSession();
      onClearSession?.();
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4">
      <h2 className="text-lg font-medium mb-4">Settings</h2>

      <div className="flex flex-col gap-6">
        {/* API Key Manager */}
        <ApiKeyManager onTierChange={updateTier} />
        {/* Session Restore Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Auto-restore session
            </label>
            <p className="text-xs text-gray-500">
              Automatically restore your last session when you reload the page
            </p>
          </div>
          <button
            onClick={handleToggleSessionRestore}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSessionRestoreEnabled ? "bg-blue-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={isSessionRestoreEnabled}
            aria-label="Toggle session restore"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isSessionRestoreEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Clear Session Button */}
        <div className="pt-2 border-t border-neutral-100">
          <Button
            variant="secondary"
            size="md"
            onClick={handleClearSession}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear Saved Session
          </Button>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-500 pt-2 border-t border-neutral-100">
          <p className="text-sm">
            Session data includes: uploaded files, canvas settings, overlays,
            and export preferences. Data is stored locally in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}

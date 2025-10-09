/**
 * Forge Layer v0.2 Version Banner Component
 * Displays connection status and version information
 */

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { getVersionInfo, healthCheck } from "@/lib/api";

interface VersionInfo {
  version: string;
  layer: string;
}

interface HealthStatus {
  status: string;
  version: string;
}

export function ForgeVersionBanner() {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check both health and version
        const [health, version] = await Promise.all([
          healthCheck(),
          getVersionInfo(),
        ]);

        setHealthStatus(health);
        setVersionInfo(version);
        setIsConnected(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection failed");
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-800">
            Connecting to Forge Layer v0.2...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <XCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-800">
            Failed to connect to Forge Layer v0.2: {error}
          </span>
        </div>
      </div>
    );
  }

  if (isConnected && versionInfo) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Layer v0.2 connected
            </span>
          </div>
          <div className="text-xs text-green-700">
            {versionInfo.version} • {healthStatus?.status}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

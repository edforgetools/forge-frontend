/**
 * API Key Manager component for handling Bearer token authentication
 */

import { useState, useEffect } from "react";
import { validateApiKey, type Tier } from "@/lib/auth-utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Key, CheckCircle, XCircle } from "lucide-react";

interface ApiKeyManagerProps {
  onTierChange?: (tier: Tier) => void;
  className?: string;
}

export function ApiKeyManager({ onTierChange, className }: ApiKeyManagerProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [currentTier, setCurrentTier] = useState<Tier>("free");
  const [isValid, setIsValid] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem("forge_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      validateKey(storedKey);
    }
  }, []);

  const validateKey = (key: string) => {
    const { isValid: keyValid, tier } = validateApiKey(
      key ? `Bearer ${key}` : ""
    );
    setIsValid(keyValid);
    setCurrentTier(tier);
    onTierChange?.(tier);
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    validateKey(value);
  };

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("forge_api_key", apiKey.trim());
    } else {
      localStorage.removeItem("forge_api_key");
    }
  };

  const handleClearKey = () => {
    setApiKey("");
    setIsValid(false);
    setCurrentTier("free");
    localStorage.removeItem("forge_api_key");
    onTierChange?.("free");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key Authentication
        </CardTitle>
        <CardDescription>
          Enter your Bearer token to access pro features and bypass rate limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder="Enter your Bearer token"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="md"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Button onClick={handleSaveKey} disabled={!apiKey.trim()}>
              Save
            </Button>
            <Button variant="secondary" onClick={handleClearKey}>
              Clear
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {isValid ? (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Valid</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Invalid</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tier:</span>
            <Badge variant={currentTier === "pro" ? "default" : "secondary"}>
              {currentTier.toUpperCase()}
            </Badge>
          </div>
        </div>

        {currentTier === "pro" && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            <strong>Pro Features Active:</strong>
            <ul className="list-disc list-inside space-y-1">
              <li>Higher payload size limits (50MB vs 10MB)</li>
              <li>Rate limit bypass</li>
              <li>Priority processing</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

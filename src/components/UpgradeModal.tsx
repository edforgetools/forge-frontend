import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Zap,
  Download,
  Cloud,
  Shield,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCanvasStore } from "@/state/canvasStore";
import { validateApiKey } from "@/lib/auth-utils";
import { useRateLimitStore } from "@/state/rateLimitStore";

interface UpgradeModalProps {
  children: React.ReactNode;
}

const proBenefits = [
  {
    icon: <Download className="w-5 h-5 text-blue-600" />,
    title: "HD Export",
    description:
      "Export your thumbnails in high definition up to 4K resolution",
  },
  {
    icon: <Shield className="w-5 h-5 text-green-600" />,
    title: "Watermark Removal",
    description: "Remove watermarks and create clean, professional thumbnails",
  },
  {
    icon: <Cloud className="w-5 h-5 text-purple-600" />,
    title: "Cloud Save",
    description:
      "Save your projects in the cloud and access them from anywhere",
  },
  {
    icon: <Zap className="w-5 h-5 text-yellow-600" />,
    title: "Advanced Features",
    description: "Unlock premium tools and advanced editing capabilities",
  },
];

export function UpgradeModal({ children }: UpgradeModalProps) {
  const { isPro, setIsPro } = useCanvasStore();
  const { updateTier } = useRateLimitStore();
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isValidKey, setIsValidKey] = useState(false);

  // Check if user already has a valid pro key
  React.useEffect(() => {
    const storedKey = localStorage.getItem("forge_api_key");
    if (storedKey) {
      const { isValid, tier } = validateApiKey(`Bearer ${storedKey}`);
      if (isValid && tier === "pro") {
        setIsPro(true);
      }
    }
  }, [setIsPro]);

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    const { isValid, tier } = validateApiKey(value ? `Bearer ${value}` : "");
    setIsValidKey(isValid && tier === "pro");
  };

  const handleSaveKey = () => {
    if (apiKey.trim() && isValidKey) {
      localStorage.setItem("forge_api_key", apiKey.trim());
      setIsPro(true);
      updateTier(); // Update rate limit store
    }
  };

  if (isPro) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="w-[18px] h-[18px]" />
        <span className="text-sm font-medium">Pro Active</span>
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Upgrade for Unlimited
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* API Key Input Section */}
          <div className="space-y-4">
            <div className="text-center">
              <Key className="w-12 h-12 mx-auto text-blue-600 mb-3" />
              <h3 className="text-lg font-semibold text-gray-800">
                Enter Your Pro Key
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter your API key to unlock unlimited generations
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="pro-api-key">Pro API Key</Label>
              <div className="relative">
                <Input
                  id="pro-api-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder="Enter your pro API key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
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

              {apiKey && (
                <div className="flex items-center gap-2 text-sm">
                  {isValidKey ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Valid Pro Key</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <Key className="h-4 w-4" />
                      <span>Invalid Key</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              onClick={handleSaveKey}
              disabled={!isValidKey}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
              size="lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Activate Pro
            </Button>
          </div>

          {/* Pro Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-gray-800">
              Pro Features
            </h3>
            <div className="grid gap-3">
              {proBenefits.map((benefit, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">{benefit.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {benefit.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Fine Print */}
          <div className="text-xs text-center text-gray-500">
            <p>
              Your API key is stored locally and never shared with third
              parties.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

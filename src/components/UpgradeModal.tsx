import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Zap, Download, Cloud, Shield } from "lucide-react";
import { useCanvasStore } from "@/state/canvasStore";

interface UpgradeModalProps {
  children: React.ReactNode;
}

const proBenefits = [
  {
    icon: <Download className="w-6 h-6 text-blue-600" />,
    title: "HD Export",
    description: "Export your thumbnails in high definition up to 4K resolution",
  },
  {
    icon: <Shield className="w-6 h-6 text-green-600" />,
    title: "Watermark Removal",
    description: "Remove watermarks and create clean, professional thumbnails",
  },
  {
    icon: <Cloud className="w-6 h-6 text-purple-600" />,
    title: "Cloud Save",
    description: "Save your projects in the cloud and access them from anywhere",
  },
  {
    icon: <Zap className="w-6 h-6 text-yellow-600" />,
    title: "Advanced Features",
    description: "Unlock premium tools and advanced editing capabilities",
  },
];

export function UpgradeModal({ children }: UpgradeModalProps) {
  const { isPro, setIsPro } = useCanvasStore();

  const handleUpgrade = () => {
    // Placeholder for future Stripe integration
    console.log("Upgrade to Pro clicked - Stripe integration coming soon");
    
    // For now, just simulate upgrading (remove this in production)
    setIsPro(true);
  };

  if (isPro) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <CheckCircle className="w-4 h-4" />
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
            Upgrade to Pro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pro Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-gray-800">
              Unlock Premium Features
            </h3>
            <div className="grid gap-4">
              {proBenefits.map((benefit, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {benefit.icon}
                      </div>
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

          {/* Pricing Placeholder */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                $9.99
                <span className="text-lg font-normal text-gray-600">/month</span>
              </div>
              <p className="text-sm text-gray-600">
                Cancel anytime • 7-day free trial
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Free Trial
          </Button>

          {/* Fine Print */}
          <div className="text-xs text-center text-gray-500">
            <p>
              By upgrading, you agree to our Terms of Service and Privacy Policy.
            </p>
            <p className="mt-1">
              Payment processing powered by Stripe (coming soon)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

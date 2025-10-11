import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Sparkles, Zap, ArrowRight, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface V2BetaCTAProps {
  className?: string;
  onDismiss?: () => void;
}

export function V2BetaCTA({ className, onDismiss }: V2BetaCTAProps) {
  const [isVisible, setIsVisible] = useState(true);
  const { toast } = useToast();

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();

    // Store dismissal in localStorage
    localStorage.setItem("snapthumb_v2_cta_dismissed", "true");
  };

  const handleTryV2 = () => {
    // In a real implementation, this would redirect to v2
    toast({
      title: "Snapthumb v2 Beta",
      description: "Redirecting to the beta version...",
    });

    // For now, just show a message
    setTimeout(() => {
      toast({
        title: "Coming Soon!",
        description: "Snapthumb v2 is currently in development. Stay tuned!",
      });
    }, 1000);
  };

  const handleLearnMore = () => {
    toast({
      title: "Snapthumb v2 Features",
      description:
        "AI-powered cropping, advanced filters, batch processing, and more!",
    });
  };

  if (!isVisible) return null;

  return (
    <Card
      className={`relative overflow-hidden border-2 border-gradient-to-r from-purple-500 to-pink-500 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Snapthumb v2 Beta
              </h3>
              <p className="text-sm text-gray-600">
                Experience the future of thumbnail creation
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">New Features</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                AI-powered smart cropping
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Advanced filters & effects
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Batch processing
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Template library
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Improvements</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                3x faster processing
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Better export quality
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Cloud sync
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-500" />
                Collaborative editing
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleTryV2}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Try v2 Beta
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="outline"
            onClick={handleLearnMore}
            className="flex-1"
          >
            Learn More
          </Button>
        </div>

        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-medium">Beta Access:</span> Free for all users
            during beta period. Help shape the future of Snapthumb!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

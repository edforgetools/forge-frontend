import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Camera, Video, Download, ExternalLink } from "lucide-react";

interface IndexPageProps {
  onStart: () => void;
}

export default function IndexPage({ onStart }: IndexPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo/Icon */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="text-5xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Snapthumb
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-xl text-gray-600 mb-12 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Create perfect thumbnails from your videos and images with our
          intuitive editor
        </motion.p>

        {/* Features */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <Video className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900 mb-2">Video Frames</h2>
            <p className="text-sm text-gray-600">
              Extract frames from any video at any timestamp
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <Camera className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900 mb-2">Smart Cropping</h2>
            <p className="text-sm text-gray-600">
              Auto-crop to perfect 16:9 aspect ratio
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <Download className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h2 className="font-semibold text-gray-900 mb-2">Export Ready</h2>
            <p className="text-sm text-gray-600">
              Optimized files under 2MB for all platforms
            </p>
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Creating
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-16 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="mb-4">
            Drag & drop support • Keyboard shortcuts • Responsive design
          </p>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            <button
              onClick={() => (window.location.href = "/about")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => (window.location.href = "/privacy")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => (window.location.href = "/terms")}
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms
            </button>
          </div>

          {/* Built with Forge Badge */}
          <div className="flex items-center justify-center">
            <a
              href="https://forge.tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 hover:text-gray-900 transition-colors text-sm"
            >
              <span>Built with</span>
              <span className="font-semibold">Forge</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";

export function EditorSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Top Toolbar Skeleton */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel Skeleton */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Toolbar Buttons Skeleton */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Panel Content Skeleton */}
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel Skeleton */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {/* Canvas Toolbar Skeleton */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
              <div className="w-24 h-8 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Canvas Skeleton */}
          <div className="flex-1 p-6 flex items-center justify-center">
            <motion.div
              className="w-96 h-64 bg-gray-200 rounded-2xl animate-pulse"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Export Button Skeleton */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="w-32 h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

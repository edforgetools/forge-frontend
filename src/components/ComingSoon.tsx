import React from "react";

export default function ComingSoon() {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Coming Soon</h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            We're working hard to bring you this amazing tool. Stay tuned for
            updates and be the first to know when it's ready!
          </p>
        </div>

        <div className="space-y-4">
          <button className="btn w-full">Get Notified When Ready</button>
          <p className="text-sm text-gray-400">
            Join our newsletter to get early access and updates
          </p>
        </div>
      </div>
    </div>
  );
}

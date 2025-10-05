interface IndexPageProps {
  onStart: () => void;
}

export default function IndexPage({ onStart }: IndexPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Snapthumb</h1>
        <p className="text-lg text-gray-600 mb-8">
          Create perfect thumbnails from your videos and images
        </p>
        <button
          onClick={onStart}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Start Creating
        </button>
      </div>
    </div>
  );
}
